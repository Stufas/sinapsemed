import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Calendar, Target, TrendingUp, BookOpen, ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const Demo = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-primary p-1.5 sm:p-2">
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold">Sinapse Med</span>
          </Link>
          <Button size="sm" asChild className="min-h-[44px]">
            <Link to="/onboarding" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Comece por R$ 29,90/mês</span>
              <span className="sm:hidden">Começar</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-primary py-12 sm:py-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Veja Como Funciona
          </h1>
          <p className="text-base sm:text-lg text-white/90">
            Explore as principais funcionalidades da plataforma
          </p>
        </div>
      </section>

      {/* Demo Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 sm:space-y-8">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <TabsTrigger value="dashboard" className="text-xs sm:text-sm min-h-[44px]">Dashboard</TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs sm:text-sm min-h-[44px]">Calendário</TabsTrigger>
              <TabsTrigger value="flashcards" className="text-xs sm:text-sm min-h-[44px]">Flashcards</TabsTrigger>
              <TabsTrigger value="practice" className="text-xs sm:text-sm min-h-[44px]">Simulados</TabsTrigger>
              <TabsTrigger value="content" className="text-xs sm:text-sm min-h-[44px] col-span-2 sm:col-span-1">Conteúdo IA</TabsTrigger>
            </TabsList>

            {/* Dashboard Demo */}
            <TabsContent value="dashboard" className="space-y-8 mt-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Dashboard Personalizado</h2>
                <p className="text-muted-foreground text-base md:text-lg">
                  Acompanhe todo seu progresso em um só lugar
                </p>
              </div>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3 flex-shrink-0">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">Horas Estudadas</p>
                      <p className="text-2xl font-bold">127h</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-secondary/10 p-3 flex-shrink-0">
                      <Target className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">Flashcards</p>
                      <p className="text-2xl font-bold">842</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-accent/10 p-3 flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">Taxa de Acerto</p>
                      <p className="text-2xl font-bold">87%</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3 flex-shrink-0">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">Próxima Prova</p>
                      <p className="text-2xl font-bold">7 dias</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="font-semibold mb-6">Progresso por Matéria</h3>
                <div className="space-y-6">
                  {['Anatomia', 'Fisiologia', 'Patologia'].map((subject, index) => (
                    <div key={subject}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{subject}</span>
                        <span className="text-sm text-muted-foreground">{[85, 72, 91][index]}%</span>
                      </div>
                      <Progress value={[85, 72, 91][index]} />
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Calendar Demo */}
            <TabsContent value="calendar" className="space-y-8 mt-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Calendário Inteligente</h2>
                <p className="text-muted-foreground text-base md:text-lg">
                  Organize provas, trabalhos e sessões de estudo
                </p>
              </div>

              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="rounded bg-primary/10 px-3 py-2 flex-shrink-0">
                      <p className="text-xs text-muted-foreground">15</p>
                      <p className="text-sm font-bold">MAR</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">Prova de Anatomia</p>
                      <p className="text-sm text-muted-foreground">09:00 - Sala 204</p>
                    </div>
                    <span className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-xs flex-shrink-0">
                      Prova
                    </span>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="rounded bg-secondary/10 px-3 py-2 flex-shrink-0">
                      <p className="text-xs text-muted-foreground">18</p>
                      <p className="text-sm font-bold">MAR</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">Trabalho de Fisiologia</p>
                      <p className="text-sm text-muted-foreground">Entrega até 23:59</p>
                    </div>
                    <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs flex-shrink-0">
                      Trabalho
                    </span>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="rounded bg-accent/10 px-3 py-2 flex-shrink-0">
                      <p className="text-xs text-muted-foreground">20</p>
                      <p className="text-sm font-bold">MAR</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">Sessão de Estudos - Patologia</p>
                      <p className="text-sm text-muted-foreground">14:00 - 17:00</p>
                    </div>
                    <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs flex-shrink-0">
                      Estudo
                    </span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Flashcards Demo */}
            <TabsContent value="flashcards" className="space-y-8 mt-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Sistema de Flashcards</h2>
                <p className="text-muted-foreground text-base md:text-lg">
                  Repetição espaçada baseada em ciência
                </p>
              </div>

              <Card className="p-6 md:p-8 min-h-[400px] flex flex-col items-center justify-center">
                <div className="w-full max-w-2xl">
                  <div className="mb-6 text-center">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                      Anatomia
                    </span>
                    <p className="text-xl md:text-2xl font-semibold">
                      Quais são os ossos do crânio?
                    </p>
                  </div>
                  <div className="bg-muted p-6 rounded-lg mb-6">
                    <p className="text-center text-muted-foreground">
                      Clique para revelar a resposta
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-destructive">15</p>
                      <p className="text-xs md:text-sm text-muted-foreground">Para revisar</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">42</p>
                      <p className="text-xs md:text-sm text-muted-foreground">Aprendendo</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">128</p>
                      <p className="text-xs md:text-sm text-muted-foreground">Dominados</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Practice Demo */}
            <TabsContent value="practice" className="space-y-8 mt-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Simulados e Questões</h2>
                <p className="text-muted-foreground text-base md:text-lg">
                  Pratique e receba feedback instantâneo
                </p>
              </div>

              <Card className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Questão 1 de 10</span>
                    <span className="text-sm text-muted-foreground">Anatomia</span>
                  </div>
                  <Progress value={10} />
                </div>

                <div className="mb-6">
                  <p className="text-base md:text-lg font-semibold mb-4">
                    Qual estrutura é responsável pela filtração do sangue nos rins?
                  </p>
                  <div className="space-y-3">
                    {['Néfron', 'Ureter', 'Bexiga', 'Uretra'].map((option, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border hover:bg-muted cursor-pointer transition-colors"
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center pt-6 border-t">
                  <div>
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Questões</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">87%</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Acertos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Simulados</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Content IA Demo */}
            <TabsContent value="content" className="space-y-8 mt-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">IA para Geração de Conteúdo</h2>
                <p className="text-muted-foreground text-base md:text-lg">
                  Faça upload de PDFs e gere questões e flashcards automaticamente
                </p>
              </div>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="h-6 w-6 text-primary flex-shrink-0" />
                    <h3 className="font-semibold">Upload de PDFs</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Faça upload de apostilas e livros',
                      'IA extrai conteúdo relevante',
                      'Organiza por matéria automaticamente'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="h-6 w-6 text-primary flex-shrink-0" />
                    <h3 className="font-semibold">Geração Automática</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Questões de múltipla escolha',
                      'Flashcards otimizados',
                      'Explicações detalhadas'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              <Card className="p-6 md:p-8 bg-gradient-primary">
                <div className="text-center text-white">
                  <Brain className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Economize Horas de Preparação
                  </h3>
                  <p className="text-white/90 mb-4">
                    A IA cria materiais de estudo personalizados em minutos
                  </p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para Começar?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Junte-se a milhares de estudantes que já transformaram seus estudos
          </p>
          <Button size="lg" asChild>
            <Link to="/onboarding">
              Comece por R$ 29,90/mês
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Demo;
