import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, RotateCcw, Check, X, Brain, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Flashcard {
  id: string;
  subject: string;
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
  lastReviewed?: string;
  nextReview?: string;
  reviewCount: number;
  correctCount: number;
}

const FlashcardsPage = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem("flashcards");
    return saved ? JSON.parse(saved) : [];
  });

  const [newCard, setNewCard] = useState({
    subject: "",
    front: "",
    back: "",
  });

  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [cardsToReview, setCardsToReview] = useState<Flashcard[]>([]);

  const saveFlashcards = (cards: Flashcard[]) => {
    setFlashcards(cards);
    localStorage.setItem("flashcards", JSON.stringify(cards));
  };

  const addFlashcard = () => {
    if (!newCard.subject.trim() || !newCard.front.trim() || !newCard.back.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    const card: Flashcard = {
      id: Date.now().toString(),
      subject: newCard.subject,
      front: newCard.front,
      back: newCard.back,
      difficulty: "medium",
      reviewCount: 0,
      correctCount: 0,
    };

    saveFlashcards([...flashcards, card]);
    setNewCard({ subject: "", front: "", back: "" });
    toast.success("Flashcard criado!");
  };

  const deleteFlashcard = (id: string) => {
    saveFlashcards(flashcards.filter(card => card.id !== id));
    toast.success("Flashcard removido");
  };

  const startStudySession = () => {
    if (flashcards.length === 0) {
      toast.error("Adicione flashcards primeiro");
      return;
    }
    setCardsToReview([...flashcards]);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setStudyMode(true);
  };

  const handleAnswer = (correct: boolean) => {
    const currentCard = cardsToReview[currentCardIndex];
    const updatedCard = {
      ...currentCard,
      reviewCount: currentCard.reviewCount + 1,
      correctCount: currentCard.correctCount + (correct ? 1 : 0),
      lastReviewed: new Date().toISOString(),
    };

    const updatedFlashcards = flashcards.map(card =>
      card.id === currentCard.id ? updatedCard : card
    );
    saveFlashcards(updatedFlashcards);

    if (currentCardIndex < cardsToReview.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      toast.success("Sessão de estudos concluída!");
      setStudyMode(false);
      setCurrentCardIndex(0);
    }
  };

  const stats = {
    total: flashcards.length,
    reviewed: flashcards.filter(c => c.reviewCount > 0).length,
    mastered: flashcards.filter(c => c.reviewCount > 0 && (c.correctCount / c.reviewCount) >= 0.8).length,
  };

  const progress = stats.total > 0 ? (stats.reviewed / stats.total) * 100 : 0;

  if (studyMode && cardsToReview.length > 0) {
    const currentCard = cardsToReview[currentCardIndex];
    const sessionProgress = ((currentCardIndex + 1) / cardsToReview.length) * 100;

    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">
              Carta {currentCardIndex + 1} de {cardsToReview.length}
            </h2>
            <Button variant="outline" size="sm" onClick={() => setStudyMode(false)}>
              Sair
            </Button>
          </div>
          <Progress value={sessionProgress} className="h-2" />
        </div>

        <Card className="p-8 min-h-[400px] flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl">
            <div className="mb-4 text-center">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {currentCard.subject}
              </span>
            </div>

            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground mb-2">
                {showAnswer ? "Resposta:" : "Pergunta:"}
              </p>
              <p className="text-2xl font-semibold">
                {showAnswer ? currentCard.back : currentCard.front}
              </p>
            </div>

            {!showAnswer ? (
              <Button 
                onClick={() => setShowAnswer(true)} 
                className="w-full" 
                size="lg"
              >
                Mostrar Resposta
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleAnswer(false)}
                  variant="outline"
                  size="lg"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="mr-2 h-5 w-5" />
                  Errei
                </Button>
                <Button
                  onClick={() => handleAnswer(true)}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-2 h-5 w-5" />
                  Acertei
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Flashcards</h1>
        <p className="text-muted-foreground">
          Crie e revise seus flashcards de estudo
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Cards</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-secondary/10 p-3">
              <RotateCcw className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revisados</p>
              <p className="text-2xl font-bold">{stats.reviewed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-accent/10 p-3">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dominados</p>
              <p className="text-2xl font-bold">{stats.mastered}</p>
            </div>
          </div>
        </Card>
      </div>

      {stats.total > 0 && (
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Progresso Geral</h3>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </Card>
      )}

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Criar Flashcards</TabsTrigger>
          <TabsTrigger value="review">Meus Flashcards</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Criar Novo Flashcard</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Matéria</Label>
                <Input
                  id="subject"
                  placeholder="Ex: Anatomia"
                  value={newCard.subject}
                  onChange={(e) => setNewCard({ ...newCard, subject: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="front">Pergunta (Frente)</Label>
                <Textarea
                  id="front"
                  placeholder="Ex: Quais são os ossos do crânio?"
                  value={newCard.front}
                  onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                  className="mt-2 min-h-24"
                />
              </div>
              <div>
                <Label htmlFor="back">Resposta (Verso)</Label>
                <Textarea
                  id="back"
                  placeholder="Ex: Frontal, parietal, temporal, occipital, esfenoide e etmoide"
                  value={newCard.back}
                  onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                  className="mt-2 min-h-24"
                />
              </div>
              <Button onClick={addFlashcard} className="w-full" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Adicionar Flashcard
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          {flashcards.length === 0 ? (
            <Card className="p-12 text-center">
              <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                Nenhum flashcard ainda
              </h3>
              <p className="text-muted-foreground mb-6">
                Crie seu primeiro flashcard para começar a estudar
              </p>
            </Card>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <Button onClick={startStudySession} size="lg">
                  <Brain className="mr-2 h-5 w-5" />
                  Iniciar Sessão de Estudos
                </Button>
              </div>

              <div className="space-y-4">
                {flashcards.map((card) => {
                  const accuracy = card.reviewCount > 0 
                    ? Math.round((card.correctCount / card.reviewCount) * 100) 
                    : 0;

                  return (
                    <Card key={card.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                              {card.subject}
                            </span>
                            {card.reviewCount > 0 && (
                              <span className="text-xs text-muted-foreground">
                                Revisado {card.reviewCount}x • {accuracy}% acertos
                              </span>
                            )}
                          </div>
                          <p className="font-semibold mb-2">{card.front}</p>
                          <p className="text-sm text-muted-foreground">{card.back}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFlashcard(card.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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

export default FlashcardsPage;
