import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, Brain, TrendingUp, Clock, CheckCircle2, Flame, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SubscriptionCard from "@/components/SubscriptionCard";

interface UserStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

const Dashboard = () => {
  const { signOut } = useAuth();
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (streakData) {
        setStreak(streakData);
      } else {
        // Initialize streak for new user
        const { data: newStreak } = await supabase
          .from("user_streaks")
          .insert({
            user_id: user.id,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: new Date().toISOString().split('T')[0]
          })
          .select()
          .single();

        if (newStreak) {
          setStreak(newStreak);
        }
      }
    } catch (error) {
      console.error("Error loading streak:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserGreeting = () => {
    const userProfileStr = localStorage.getItem("userProfile");
    if (!userProfileStr) {
      return "Olá, Dr. 👋";
    }
    
    try {
      const userProfile = JSON.parse(userProfileStr);
      const name = userProfile.name || "";
      const gender = userProfile.gender || "";
      
      let title = "Dr.";
      if (gender === "masculino") {
        title = "Doutor";
      } else if (gender === "feminino") {
        title = "Doutora";
      }
      
      return `Olá, ${title} ${name} 👋`;
    } catch {
      return "Olá, Dr. 👋";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="mb-2 text-2xl sm:text-3xl font-bold">{getUserGreeting()}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Aqui está um resumo do seu progresso hoje</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>

        {!loading && streak && (
          <Card className="p-4 shadow-card w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-primary p-3">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{streak.current_streak}</p>
                <p className="text-xs text-muted-foreground">dias de streak 🔥</p>
              </div>
            </div>
            {streak.longest_streak > streak.current_streak && (
              <p className="mt-2 text-xs text-muted-foreground border-t pt-2">
                Melhor: {streak.longest_streak} dias
              </p>
            )}
          </Card>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 sm:p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Horas Estudadas</p>
              <p className="text-xl sm:text-2xl font-bold">4.5h</p>
              <p className="text-xs text-success">+12%</p>
            </div>
            <div className="rounded-full bg-primary/10 p-2 sm:p-3 flex-shrink-0">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Flashcards</p>
              <p className="text-xl sm:text-2xl font-bold">42</p>
              <p className="text-xs text-muted-foreground">15 pend.</p>
            </div>
            <div className="rounded-full bg-secondary/10 p-2 sm:p-3 flex-shrink-0">
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Acertos</p>
              <p className="text-xl sm:text-2xl font-bold">85%</p>
              <p className="text-xs text-success">+5%</p>
            </div>
            <div className="rounded-full bg-accent/10 p-2 sm:p-3 flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Próx. Prova</p>
              <p className="text-xl sm:text-2xl font-bold">12 dias</p>
              <p className="text-xs text-warning truncate">Anatomia I</p>
            </div>
            <div className="rounded-full bg-warning/10 p-2 sm:p-3 flex-shrink-0">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
            </div>
          </div>
        </Card>
      </div>

      {/* Subscription Card */}
      <SubscriptionCard />

      {/* Main Content Tabs */}
      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="progress" className="text-xs sm:text-sm min-h-[44px]">
            <TrendingUp className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Progresso</span>
            <span className="sm:hidden">Prog.</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs sm:text-sm min-h-[44px]">
            <Calendar className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Cronograma</span>
            <span className="sm:hidden">Crono.</span>
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="text-xs sm:text-sm min-h-[44px]">
            <Brain className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Flashcards</span>
            <span className="sm:hidden">Flash.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <Card className="p-4 sm:p-6 shadow-card">
            <h3 className="mb-4 text-base sm:text-lg font-semibold">Progresso por Matéria</h3>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">Anatomia I</span>
                  <span className="text-sm text-muted-foreground">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">Fisiologia</span>
                  <span className="text-sm text-muted-foreground">60%</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">Bioquímica</span>
                  <span className="text-sm text-muted-foreground">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">Histologia</span>
                  <span className="text-sm text-muted-foreground">90%</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
            </div>
          </Card>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card className="p-4 sm:p-6 shadow-card">
              <h3 className="mb-4 text-base sm:text-lg font-semibold">Tópicos para Revisar</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                  <BookOpen className="h-4 w-4 text-warning" />
                  <span className="text-sm">Sistema Cardiovascular</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                  <BookOpen className="h-4 w-4 text-warning" />
                  <span className="text-sm">Ciclo de Krebs</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                  <BookOpen className="h-4 w-4 text-warning" />
                  <span className="text-sm">Tecido Epitelial</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 shadow-card">
              <h3 className="mb-4 text-base sm:text-lg font-semibold">Conquistas Recentes</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm">7 dias de estudo consecutivos</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm">100 flashcards dominados</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm">Simulado com 90% de acerto</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="p-4 sm:p-6 shadow-card">
            <h3 className="mb-4 text-base sm:text-lg font-semibold">Próximas Atividades</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <div className="rounded-full bg-calendar-exam/10 p-2">
                  <Calendar className="h-5 w-5 text-calendar-exam" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Prova de Anatomia I</p>
                  <p className="text-sm text-muted-foreground">25 de Outubro, 2025 - 14:00</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <div className="rounded-full bg-calendar-assignment/10 p-2">
                  <BookOpen className="h-5 w-5 text-calendar-assignment" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Trabalho de Fisiologia</p>
                  <p className="text-sm text-muted-foreground">20 de Outubro, 2025 - 23:59</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <div className="rounded-full bg-calendar-study/10 p-2">
                  <Brain className="h-5 w-5 text-calendar-study" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Sessão de Revisão - Bioquímica</p>
                  <p className="text-sm text-muted-foreground">Hoje, 18:00</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="flashcards">
          <Card className="p-4 sm:p-6 shadow-card">
            <h3 className="mb-4 text-base sm:text-lg font-semibold">Flashcards para Hoje</h3>
            <div className="mb-6 rounded-lg bg-gradient-primary p-6 text-center">
              <p className="mb-2 text-4xl font-bold text-white">15</p>
              <p className="text-white/90">Cartões aguardando revisão</p>
            </div>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="mb-1 text-sm text-muted-foreground">Novos</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="mb-1 text-sm text-muted-foreground">Revisão</p>
                <p className="text-2xl font-bold">7</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="mb-1 text-sm text-muted-foreground">Dominados</p>
                <p className="text-2xl font-bold text-success">156</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="mb-1 text-sm text-muted-foreground">Aprendendo</p>
                <p className="text-2xl font-bold text-warning">34</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
