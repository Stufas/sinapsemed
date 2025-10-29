import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, CheckCircle2, XCircle, Plus, Trash2, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  answered?: boolean;
  correct?: boolean;
}

const QuestionsPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [newQuestion, setNewQuestion] = useState({
    subject: "",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("questions");
    if (saved) {
      setQuestions(JSON.parse(saved));
    }
  }, []);

  const saveQuestions = (updatedQuestions: Question[]) => {
    localStorage.setItem("questions", JSON.stringify(updatedQuestions));
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    if (!newQuestion.subject || !newQuestion.question || newQuestion.options.some(opt => !opt.trim())) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos da questão",
        variant: "destructive"
      });
      return;
    }

    const question: Question = {
      id: Date.now().toString(),
      ...newQuestion
    };

    saveQuestions([...questions, question]);
    setNewQuestion({
      subject: "",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: ""
    });

    toast({
      title: "Questão adicionada!",
      description: "Questão criada com sucesso"
    });
  };

  const deleteQuestion = (id: string) => {
    saveQuestions(questions.filter(q => q.id !== id));
    toast({
      title: "Questão removida",
      description: "A questão foi excluída"
    });
  };

  const startPractice = () => {
    const available = filterSubject === "all" 
      ? questions.filter(q => !q.answered)
      : questions.filter(q => q.subject === filterSubject && !q.answered);

    if (available.length === 0) {
      toast({
        title: "Sem questões disponíveis",
        description: "Não há questões não respondidas neste filtro",
        variant: "destructive"
      });
      return;
    }

    const random = available[Math.floor(Math.random() * available.length)];
    setCurrentQuestion(random);
    setSelectedAnswer(null);
    setShowAnswer(false);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const updated = questions.map(q => 
      q.id === currentQuestion.id 
        ? { ...q, answered: true, correct: isCorrect }
        : q
    );
    
    saveQuestions(updated);
    setShowAnswer(true);

    toast({
      title: isCorrect ? "Resposta correta! 🎉" : "Resposta incorreta",
      description: isCorrect ? "Continue praticando!" : "Revise o conteúdo e tente novamente",
      variant: isCorrect ? "default" : "destructive"
    });
  };

  const nextQuestion = () => {
    startPractice();
  };

  const resetStats = () => {
    const reset = questions.map(q => ({ ...q, answered: false, correct: undefined }));
    saveQuestions(reset);
    setCurrentQuestion(null);
    toast({
      title: "Estatísticas resetadas",
      description: "Todas as questões foram marcadas como não respondidas"
    });
  };

  const subjects = Array.from(new Set(questions.map(q => q.subject)));
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter(q => q.answered).length;
  const correctAnswers = questions.filter(q => q.correct).length;
  const accuracy = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Questões</h1>
        <p className="text-muted-foreground">Pratique questões individuais por matéria</p>
      </div>

      {currentQuestion ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{currentQuestion.subject}</Badge>
              <Button variant="ghost" size="sm" onClick={() => setCurrentQuestion(null)}>
                Sair
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-lg font-medium">{currentQuestion.question}</div>

            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showCorrectAnswer = showAnswer && isCorrect;
                const showWrongAnswer = showAnswer && isSelected && !isCorrect;

                return (
                  <Button
                    key={index}
                    variant={isSelected ? "secondary" : "outline"}
                    className={`w-full justify-start text-left h-auto py-3 ${
                      showCorrectAnswer ? "border-green-500 bg-green-50" :
                      showWrongAnswer ? "border-red-500 bg-red-50" : ""
                    }`}
                    onClick={() => !showAnswer && setSelectedAnswer(index)}
                    disabled={showAnswer}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{String.fromCharCode(65 + index)})</span>
                      <span>{option}</span>
                      {showCorrectAnswer && <CheckCircle2 className="ml-auto text-green-600" />}
                      {showWrongAnswer && <XCircle className="ml-auto text-red-600" />}
                    </div>
                  </Button>
                );
              })}
            </div>

            {showAnswer && currentQuestion.explanation && (
              <Card className="bg-muted">
                <CardContent className="pt-4">
                  <p className="text-sm font-medium mb-2">Explicação:</p>
                  <p className="text-sm">{currentQuestion.explanation}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              {!showAnswer ? (
                <Button 
                  className="w-full" 
                  onClick={submitAnswer}
                  disabled={selectedAnswer === null}
                >
                  Confirmar Resposta
                </Button>
              ) : (
                <Button className="w-full" onClick={nextQuestion}>
                  Próxima Questão
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total de Questões</CardDescription>
                <CardTitle className="text-3xl">{totalQuestions}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Respondidas</CardDescription>
                <CardTitle className="text-3xl">{answeredQuestions}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Acertos</CardDescription>
                <CardTitle className="text-3xl text-green-600">{correctAnswers}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Aproveitamento</CardDescription>
                <CardTitle className="text-3xl">{accuracy.toFixed(0)}%</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {totalQuestions > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Praticar Questões</CardTitle>
                <CardDescription>Selecione uma matéria ou pratique todas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Select value={filterSubject} onValueChange={setFilterSubject}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Matérias</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={startPractice}>
                    <Target className="mr-2 h-4 w-4" />
                    Começar
                  </Button>
                </div>

                {answeredQuestions > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{answeredQuestions}/{totalQuestions}</span>
                    </div>
                    <Progress value={(answeredQuestions / totalQuestions) * 100} />
                    <Button variant="outline" size="sm" className="w-full" onClick={resetStats}>
                      Resetar Estatísticas
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Gerar Questão IA</TabsTrigger>
              <TabsTrigger value="list">Minhas Questões ({totalQuestions})</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>Nova Questão</CardTitle>
                  <CardDescription>Adicione questões para praticar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Matéria</Label>
                    <Input
                      placeholder="Ex: Anatomia, Fisiologia..."
                      value={newQuestion.subject}
                      onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Questão</Label>
                    <Textarea
                      placeholder="Digite a questão..."
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Alternativas</Label>
                    {newQuestion.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options];
                            newOptions[index] = e.target.value;
                            setNewQuestion({ ...newQuestion, options: newOptions });
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Resposta Correta</Label>
                    <Select 
                      value={newQuestion.correctAnswer.toString()} 
                      onValueChange={(value) => setNewQuestion({ ...newQuestion, correctAnswer: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {newQuestion.options.map((_, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            Alternativa {String.fromCharCode(65 + index)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Explicação (opcional)</Label>
                    <Textarea
                      placeholder="Explique por que esta é a resposta correta..."
                      value={newQuestion.explanation}
                      onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                    />
                  </div>

                  <Button className="w-full" onClick={addQuestion}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Questão
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="list">
              <Card>
                <CardHeader>
                  <CardTitle>Banco de Questões</CardTitle>
                  <CardDescription>Gerencie suas questões criadas</CardDescription>
                </CardHeader>
                <CardContent>
                  {questions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma questão criada ainda.</p>
                      <p className="text-sm">Crie sua primeira questão na aba "Gerar Questão IA"</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {questions.map((question) => (
                        <Card key={question.id}>
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary">{question.subject}</Badge>
                                  {question.answered && (
                                    <Badge variant={question.correct ? "default" : "destructive"}>
                                      {question.correct ? "Acertou" : "Errou"}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm font-medium mb-2">{question.question}</p>
                                <p className="text-xs text-muted-foreground">
                                  Resposta: {String.fromCharCode(65 + question.correctAnswer)}) {question.options[question.correctAnswer]}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteQuestion(question.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default QuestionsPage;
