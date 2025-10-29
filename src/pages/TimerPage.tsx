import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Clock, Coffee, Brain, TrendingUp, BookOpen, History } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StudySessionDialog, type StudySessionConfig } from "@/components/StudySessionDialog";
import { trackActivity, POINTS } from "@/lib/points";
import { format } from "date-fns";

type TimerMode = "pomodoro" | "long-pomodoro" | "custom";
type TimerState = "idle" | "work" | "break";

const TIMER_PRESETS = {
  pomodoro: { work: 25, break: 5, longBreak: 15 },
  "long-pomodoro": { work: 50, break: 10, longBreak: 20 },
  custom: { work: 25, break: 5, longBreak: 15 },
};

interface StudySession {
  id: string;
  subject_name: string;
  topic: string;
  duration_minutes: number;
  timer_mode: string;
  completed_at: string;
  notes?: string;
}

const TimerPage = () => {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [state, setState] = useState<TimerState>("idle");
  const [timeLeft, setTimeLeft] = useState(TIMER_PRESETS.pomodoro.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [customWork, setCustomWork] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Study session tracking
  const [currentSession, setCurrentSession] = useState<StudySessionConfig | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);

  useEffect(() => {
    // Load stats from localStorage
    const saved = localStorage.getItem("timerStats");
    if (saved) {
      const stats = JSON.parse(saved);
      setSessionsCompleted(stats.sessionsCompleted || 0);
    }
    
    // Load study sessions
    loadStudySessions();
    
    // Check for saved active session
    const savedSession = localStorage.getItem("activeStudySession");
    if (savedSession) {
      try {
        const { session, startTime, timeLeft: savedTimeLeft, state: savedState, mode: savedMode } = JSON.parse(savedSession);
        toast.info("Você tem uma sessão em andamento", {
          action: {
            label: "Continuar",
            onClick: () => {
              setCurrentSession(session);
              setSessionStartTime(new Date(startTime));
              setTimeLeft(savedTimeLeft);
              setState(savedState);
              setMode(savedMode);
              setIsRunning(true);
            }
          }
        });
      } catch (error) {
        console.error("Error restoring session:", error);
        localStorage.removeItem("activeStudySession");
      }
    }
  }, []);

  useEffect(() => {
    // Save active session to localStorage
    if (currentSession && isRunning) {
      localStorage.setItem("activeStudySession", JSON.stringify({
        session: currentSession,
        startTime: sessionStartTime,
        timeLeft,
        state,
        mode
      }));
    } else {
      localStorage.removeItem("activeStudySession");
    }
  }, [currentSession, isRunning, timeLeft, state, mode, sessionStartTime]);

  const loadStudySessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setStudySessions(data || []);
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    playNotificationSound();

    if (state === "work" && currentSession && sessionStartTime) {
      // Calculate actual duration
      const durationMinutes = Math.round(
        (new Date().getTime() - sessionStartTime.getTime()) / 60000
      );
      
      // Save session to database
      await saveStudySession({
        ...currentSession,
        duration_minutes: durationMinutes,
        timer_mode: mode,
        started_at: sessionStartTime.toISOString(),
        completed_at: new Date().toISOString()
      });
      
      // Track activity points
      const points = Math.round((durationMinutes / 60) * POINTS.STUDY_HOUR);
      await trackActivity("study_session", points, {
        subject: currentSession.subjectName,
        topic: currentSession.topic,
        duration_minutes: durationMinutes
      });
      
      // Clear session
      setCurrentSession(null);
      setSessionStartTime(null);
      
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      localStorage.setItem("timerStats", JSON.stringify({ sessionsCompleted: newSessions }));
      
      setState("break");
      const breakTime = (newSessions % 4 === 0) 
        ? TIMER_PRESETS[mode].longBreak 
        : TIMER_PRESETS[mode].break;
      setTimeLeft(breakTime * 60);
      toast.success(`Sessão concluída! +${points} pontos • Hora do intervalo (${breakTime}min)`);
      
      // Reload sessions list
      loadStudySessions();
    } else if (state === "break") {
      setState("work");
      const workTime = mode === "custom" ? customWork : TIMER_PRESETS[mode].work;
      setTimeLeft(workTime * 60);
      toast.success("Intervalo finalizado! Hora de voltar aos estudos");
    }
  };

  const saveStudySession = async (session: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("study_sessions").insert({
        user_id: user.id,
        subject_id: session.subjectId,
        subject_name: session.subjectName,
        topic: session.topic,
        duration_minutes: session.duration_minutes,
        timer_mode: session.timer_mode,
        started_at: session.started_at,
        completed_at: session.completed_at,
        notes: session.notes
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving session:", error);
      toast.error("Erro ao salvar sessão de estudo");
    }
  };

  const playNotificationSound = () => {
    // Create a more noticeable notification with 3 beeps
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playBeep = (time: number, frequency: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      // Envelope for smooth sound
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.5, time + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, time + 0.3);
      
      oscillator.start(time);
      oscillator.stop(time + 0.3);
    };
    
    // Play 3 beeps with increasing pitch
    const startTime = audioContext.currentTime;
    playBeep(startTime, 600);
    playBeep(startTime + 0.4, 700);
    playBeep(startTime + 0.8, 800);
  };

  const startTimer = () => {
    if (state === "idle") {
      // Open dialog to configure session
      setShowSessionDialog(true);
    } else {
      setIsRunning(true);
    }
  };

  const handleSessionStart = (config: StudySessionConfig) => {
    setCurrentSession(config);
    setSessionStartTime(new Date());
    setState("work");
    const workTime = mode === "custom" ? customWork : TIMER_PRESETS[mode].work;
    setTimeLeft(workTime * 60);
    setIsRunning(true);
    
    toast.success(`Sessão iniciada: ${config.subjectName} - ${config.topic}`);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setState("idle");
    setCurrentSession(null);
    setSessionStartTime(null);
    const workTime = mode === "custom" ? customWork : TIMER_PRESETS[mode].work;
    setTimeLeft(workTime * 60);
  };

  const changeMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setState("idle");
    const workTime = newMode === "custom" ? customWork : TIMER_PRESETS[newMode].work;
    setTimeLeft(workTime * 60);
  };

  const applyCustomTime = () => {
    if (customWork < 1 || customBreak < 1) {
      toast.error("Os tempos devem ser maiores que 0");
      return;
    }
    setIsRunning(false);
    setState("idle");
    setTimeLeft(customWork * 60);
    toast.success("Tempo personalizado configurado!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTotalSeconds = () => {
    if (state === "work") {
      return (mode === "custom" ? customWork : TIMER_PRESETS[mode].work) * 60;
    } else {
      return TIMER_PRESETS[mode].break * 60;
    }
  };

  const progress = ((getTotalSeconds() - timeLeft) / getTotalSeconds()) * 100;

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cronômetro de Estudos</h1>
        <p className="text-muted-foreground">
          Use métodos comprovados para otimizar seu tempo de estudo
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sessões Hoje</p>
              <p className="text-2xl font-bold">{sessionsCompleted}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-secondary/10 p-3">
              <Brain className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tempo Total</p>
              <p className="text-2xl font-bold">
                {Math.floor((sessionsCompleted * (mode === "custom" ? customWork : TIMER_PRESETS[mode].work)) / 60)}h
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-accent/10 p-3">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sequência</p>
              <p className="text-2xl font-bold">{sessionsCompleted % 4}/4</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-8">
          <Tabs value={mode} onValueChange={(v) => changeMode(v as TimerMode)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
              <TabsTrigger value="long-pomodoro">Longo</TabsTrigger>
              <TabsTrigger value="custom">Personalizado</TabsTrigger>
            </TabsList>

            <TabsContent value="pomodoro" className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Método Pomodoro Clássico</p>
                <p className="text-xs text-muted-foreground">
                  25min trabalho • 5min pausa • 15min pausa longa
                </p>
              </div>
            </TabsContent>

            <TabsContent value="long-pomodoro" className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Pomodoro Estendido</p>
                <p className="text-xs text-muted-foreground">
                  50min trabalho • 10min pausa • 20min pausa longa
                </p>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="work-time">Tempo de Trabalho (minutos)</Label>
                  <Input
                    id="work-time"
                    type="number"
                    min="1"
                    max="120"
                    value={customWork}
                    onChange={(e) => setCustomWork(parseInt(e.target.value) || 1)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="break-time">Tempo de Pausa (minutos)</Label>
                  <Input
                    id="break-time"
                    type="number"
                    min="1"
                    max="60"
                    value={customBreak}
                    onChange={(e) => setCustomBreak(parseInt(e.target.value) || 1)}
                    className="mt-2"
                  />
                </div>
                <Button onClick={applyCustomTime} className="w-full" variant="outline">
                  Aplicar Configuração
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {currentSession && state === "work" && (
            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">{currentSession.subjectName}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                📚 {currentSession.topic}
              </p>
              {currentSession.notes && (
                <p className="text-xs text-muted-foreground mt-2">
                  💭 {currentSession.notes}
                </p>
              )}
            </div>
          )}

          <div className="mt-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted mb-4">
                {state === "work" ? (
                  <><Brain className="h-4 w-4" /> Modo Foco</>
                ) : state === "break" ? (
                  <><Coffee className="h-4 w-4" /> Intervalo</>
                ) : (
                  <><Clock className="h-4 w-4" /> Pronto para Começar</>
                )}
              </div>
              <div className="text-7xl font-bold mb-4 font-mono">
                {formatTime(timeLeft)}
              </div>
              <Progress value={progress} className="h-2 mb-6" />
            </div>

            <div className="flex gap-3 justify-center">
              {!isRunning ? (
                <Button onClick={startTimer} size="lg" className="flex-1 max-w-xs">
                  <Play className="mr-2 h-5 w-5" />
                  {state === "idle" ? "Iniciar" : "Continuar"}
                </Button>
              ) : (
                <Button onClick={pauseTimer} size="lg" variant="secondary" className="flex-1 max-w-xs">
                  <Pause className="mr-2 h-5 w-5" />
                  Pausar
                </Button>
              )}
              <Button onClick={resetTimer} size="lg" variant="outline">
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="text-xl font-semibold mb-6">Como Funciona</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Método Pomodoro
              </h3>
              <p className="text-sm text-muted-foreground">
                Estude por 25 minutos com foco total, depois faça uma pausa de 5 minutos. 
                A cada 4 sessões, faça uma pausa mais longa de 15 minutos.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="h-5 w-5 text-secondary" />
                Pomodoro Estendido
              </h3>
              <p className="text-sm text-muted-foreground">
                Ideal para tarefas mais profundas. Estude por 50 minutos seguidos 
                com pausas de 10 minutos. Pausa longa de 20 minutos a cada 4 sessões.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Personalizado
              </h3>
              <p className="text-sm text-muted-foreground">
                Configure seus próprios intervalos de trabalho e pausa de acordo 
                com seu ritmo e necessidades de estudo.
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Dicas para Melhor Foco</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Elimine distrações durante as sessões</li>
              <li>• Use as pausas para descansar de verdade</li>
              <li>• Mantenha água por perto</li>
              <li>• Levante e alongue nas pausas longas</li>
            </ul>
          </div>
        </Card>

        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico Recente
            </h2>
          </div>

          {studySessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma sessão registrada ainda</p>
              <p className="text-sm mt-1">Complete sua primeira sessão de estudo!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {studySessions.map((session) => (
                <Card key={session.id} className="bg-muted/30">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{session.subject_name}</Badge>
                          <Badge variant="outline" className="text-xs">
                            {session.timer_mode}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mb-1">{session.topic}</p>
                        <p className="text-xs text-muted-foreground">
                          ⏱️ {session.duration_minutes} minutos • 
                          {format(new Date(session.completed_at), " dd/MM/yyyy 'às' HH:mm")}
                        </p>
                        {session.notes && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            💭 {session.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">
                          +{Math.round((session.duration_minutes / 60) * 20)} pts
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>

      <StudySessionDialog
        open={showSessionDialog}
        onOpenChange={setShowSessionDialog}
        onStart={handleSessionStart}
        timerMode={mode}
      />
    </div>
  );
};

export default TimerPage;
