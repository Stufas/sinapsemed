import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Sparkles, 
  Loader2,
  Clock,
  BookOpen,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Subject {
  name: string;
  priority: "high" | "medium" | "low";
  weeklyHours: number;
}

interface ScheduleEvent {
  id: string;
  subject: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  description?: string;
}

const SchedulePage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState({ name: "", priority: "medium" as const, weeklyHours: 2 });
  const [availableHours, setAvailableHours] = useState(4);
  const [studyDays, setStudyDays] = useState([1, 2, 3, 4, 5]); // Mon-Fri by default
  const [examDate, setExamDate] = useState<Date>();
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("studySubjects");
    if (saved) {
      setSubjects(JSON.parse(saved));
    }
    const savedSchedule = localStorage.getItem("studySchedule");
    if (savedSchedule) {
      setSchedule(JSON.parse(savedSchedule));
    }
  }, []);

  const saveSubjects = (updatedSubjects: Subject[]) => {
    localStorage.setItem("studySubjects", JSON.stringify(updatedSubjects));
    setSubjects(updatedSubjects);
  };

  const addSubject = () => {
    if (!newSubject.name) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome da matéria",
        variant: "destructive"
      });
      return;
    }

    saveSubjects([...subjects, newSubject]);
    setNewSubject({ name: "", priority: "medium", weeklyHours: 2 });
    
    toast({
      title: "Matéria adicionada!",
      description: "Configure todas as matérias e gere seu cronograma"
    });
  };

  const removeSubject = (index: number) => {
    saveSubjects(subjects.filter((_, i) => i !== index));
  };

  const generateSchedule = async () => {
    if (subjects.length === 0) {
      toast({
        title: "Adicione matérias",
        description: "Você precisa adicionar pelo menos uma matéria",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);

    try {
      const prompt = `Você é um especialista em planejamento de estudos. Gere um cronograma de estudos semanal personalizado.

Informações fornecidas:
- Matérias: ${subjects.map(s => `${s.name} (prioridade: ${s.priority}, horas semanais desejadas: ${s.weeklyHours}h)`).join(", ")}
- Horas disponíveis por dia: ${availableHours}h
- Dias de estudo: ${studyDays.map(d => ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d]).join(", ")}
${examDate ? `- Data da prova mais próxima: ${format(examDate, "dd/MM/yyyy")}` : ""}
${additionalInfo ? `- Informações adicionais: ${additionalInfo}` : ""}

Gere um cronograma balanceado e realista, distribuindo as matérias ao longo da semana.

IMPORTANTE: Retorne APENAS um array JSON válido no seguinte formato, sem texto adicional:
[
  {
    "subject": "Nome da Matéria",
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "11:00",
    "description": "Breve descrição do que estudar"
  }
]

Observações:
- dayOfWeek: 0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado
- Use apenas os dias especificados: ${studyDays.join(", ")}
- Horários em formato HH:mm
- Inclua pausas entre sessões longas
- Respeite as prioridades das matérias`;

      const { data, error } = await supabase.functions.invoke("generate-schedule", {
        body: { prompt }
      });

      if (error) throw error;

      if (data && Array.isArray(data.schedule)) {
        const scheduleWithIds = data.schedule.map((event: any) => ({
          ...event,
          id: Math.random().toString(36).substr(2, 9)
        }));
        
        setSchedule(scheduleWithIds);
        localStorage.setItem("studySchedule", JSON.stringify(scheduleWithIds));
        
        toast({
          title: "Cronograma gerado! 🎉",
          description: "Seu plano de estudos personalizado está pronto"
        });
      }
    } catch (error: any) {
      console.error("Error generating schedule:", error);
      toast({
        title: "Erro ao gerar cronograma",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const exportSchedule = () => {
    const text = schedule
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
      .map(event => {
        const dayName = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][event.dayOfWeek];
        return `${dayName} - ${event.startTime} às ${event.endTime}\n${event.subject}\n${event.description || ""}\n`;
      })
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cronograma-estudos.txt";
    a.click();
    
    toast({
      title: "Cronograma exportado!",
      description: "Arquivo baixado com sucesso"
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const groupedSchedule = schedule.reduce((acc, event) => {
    if (!acc[event.dayOfWeek]) {
      acc[event.dayOfWeek] = [];
    }
    acc[event.dayOfWeek].push(event);
    return acc;
  }, {} as Record<number, ScheduleEvent[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Cronograma de Estudos</h1>
        <p className="text-muted-foreground">Gere um plano personalizado com IA baseado nas suas necessidades</p>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="schedule">Cronograma</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matérias</CardTitle>
              <CardDescription>Adicione as matérias que você precisa estudar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Nome da Matéria</Label>
                  <Input
                    placeholder="Ex: Anatomia"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newSubject.priority}
                    onChange={(e) => setNewSubject({ ...newSubject, priority: e.target.value as any })}
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Horas/Semana</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={newSubject.weeklyHours}
                    onChange={(e) => setNewSubject({ ...newSubject, weeklyHours: parseInt(e.target.value) || 2 })}
                  />
                </div>
              </div>
              <Button onClick={addSubject} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Matéria
              </Button>

              {subjects.length > 0 && (
                <div className="space-y-2">
                  {subjects.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{subject.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {subject.weeklyHours}h/semana
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(subject.priority)}>
                          {subject.priority === "high" ? "Alta" : subject.priority === "medium" ? "Média" : "Baixa"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSubject(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disponibilidade</CardTitle>
              <CardDescription>Configure suas horas disponíveis para estudo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Horas disponíveis por dia</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={availableHours}
                    onChange={(e) => setAvailableHours(parseInt(e.target.value) || 4)}
                    className="w-24"
                  />
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{availableHours} horas/dia</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dias da semana disponíveis</Label>
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5, 6].map(day => {
                    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
                    const isSelected = studyDays.includes(day);
                    return (
                      <Button
                        key={day}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (isSelected) {
                            setStudyDays(studyDays.filter(d => d !== day));
                          } else {
                            setStudyDays([...studyDays, day].sort());
                          }
                        }}
                      >
                        {dayNames[day]}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data da próxima prova (opcional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !examDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {examDate ? format(examDate, "PPP") : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={examDate}
                      onSelect={setExamDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Informações adicionais (opcional)</Label>
                <Textarea
                  placeholder="Ex: Tenho dificuldade em matemática, prefiro estudar pela manhã..."
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={generateSchedule}
            disabled={generating || subjects.length === 0}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Gerando cronograma...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Gerar Cronograma com IA
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="schedule">
          {schedule.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">Nenhum cronograma gerado ainda</p>
                <p className="text-sm text-muted-foreground">Configure suas matérias e gere seu cronograma</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <Button variant="outline" onClick={exportSchedule}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Cronograma
                </Button>
              </div>
              
              <div className="grid gap-4">
                {Object.entries(groupedSchedule)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([dayOfWeek, events]) => {
                    const dayNames = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
                    return (
                      <Card key={dayOfWeek}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            {dayNames[parseInt(dayOfWeek)]}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {events
                              .sort((a, b) => a.startTime.localeCompare(b.startTime))
                              .map(event => (
                                <div
                                  key={event.id}
                                  className="p-4 rounded-lg border bg-muted/50"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold">{event.subject}</h4>
                                    <Badge variant="outline">
                                      {event.startTime} - {event.endTime}
                                    </Badge>
                                  </div>
                                  {event.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {event.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchedulePage;
