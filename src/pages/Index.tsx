import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Calendar, Target, TrendingUp, BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-primary p-2">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">Sinapse Med</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/onboarding">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/onboarding">Comece por R$ 29,90/mês</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-primary py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Brain className="h-5 w-5 text-white" />
              <span className="text-sm font-medium text-white">Plataforma de Estudos Inteligente</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl lg:text-7xl">
              Estude de Forma
              <br />
              <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                Mais Eficiente
              </span>
            </h1>
            
            <p className="mb-8 max-w-2xl text-lg text-white/90 md:text-xl">
              IA personalizada para universitários, médicos residentes e concurseiros. 
              Cronogramas adaptativos, flashcards inteligentes e calendário integrado.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" className="text-lg" asChild>
                <Link to="/onboarding">Comece por R$ 29,90/mês</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20" asChild>
                <Link to="/demo">Ver Demonstração</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Recursos Principais</h2>
            <p className="text-lg text-muted-foreground">
              Tudo que você precisa para otimizar seus estudos em um só lugar
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 shadow-card transition-all hover:shadow-elevated">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Calendário Inteligente</h3>
              <p className="text-muted-foreground">
                Visualize provas, trabalhos e aulas. Sincronização automática com seu plano de estudos.
              </p>
            </Card>

            <Card className="p-6 shadow-card transition-all hover:shadow-elevated">
              <div className="mb-4 inline-flex rounded-lg bg-secondary/10 p-3">
                <Target className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Repetição Espaçada</h3>
              <p className="text-muted-foreground">
                Flashcards com algoritmo científico que otimiza sua memorização de longo prazo.
              </p>
            </Card>

            <Card className="p-6 shadow-card transition-all hover:shadow-elevated">
              <div className="mb-4 inline-flex rounded-lg bg-accent/10 p-3">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Análise de Desempenho</h3>
              <p className="text-muted-foreground">
                Acompanhe seu progresso, identifique pontos fracos e veja sua evolução ao longo do tempo.
              </p>
            </Card>

            <Card className="p-6 shadow-card transition-all hover:shadow-elevated">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">IA Personalizada</h3>
              <p className="text-muted-foreground">
                Cronogramas adaptativos que se ajustam ao seu ritmo e priorizam o que você precisa estudar.
              </p>
            </Card>

            <Card className="p-6 shadow-card transition-all hover:shadow-elevated">
              <div className="mb-4 inline-flex rounded-lg bg-secondary/10 p-3">
                <BookOpen className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Simulados & Questões</h3>
              <p className="text-muted-foreground">
                Pratique com questões reais, receba feedback instantâneo e treine para sua prova.
              </p>
            </Card>

            <Card className="p-6 shadow-card transition-all hover:shadow-elevated">
              <div className="mb-4 inline-flex rounded-lg bg-accent/10 p-3">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Comunidade Ativa</h3>
              <p className="text-muted-foreground">
                Compartilhe estratégias, tire dúvidas e conecte-se com outros estudantes.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-primary p-8 text-center shadow-elevated md:p-12">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Pronto para Transformar seus Estudos?
            </h2>
            <p className="mb-8 text-lg text-white/90">
              Junte-se a milhares de estudantes que já estão alcançando seus objetivos
            </p>
            <Button size="lg" variant="secondary" className="text-lg" asChild>
              <Link to="/onboarding">Comece por R$ 29,90/mês</Link>
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
