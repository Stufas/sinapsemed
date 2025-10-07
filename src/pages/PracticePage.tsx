import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, BookOpen, TrendingUp, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface ExamSession {
  id: string;
  title: string;
  questions: Question[];
  startTime: string;
  endTime?: string;
  score?: number;
  answers: (number | null)[];
}

const PracticePage = () => {
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem("practiceQuestions");
    return saved ? JSON.parse(saved) : [];
  });

  const [examSessions, setExamSessions] = useState<ExamSession[]>(() => {
    const saved = localStorage.getItem("examSessions");
    return saved ? JSON.parse(saved) : [];
  });

  const [newQuestion, setNewQuestion] = useState({
    subject: "",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
  });

  const [examMode, setExamMode] = useState(false);
  const [currentExam, setCurrentExam] = useState<ExamSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const saveQuestions = (qs: Question[]) => {
    setQuestions(qs);
    localStorage.setItem("practiceQuestions", JSON.stringify(qs));
  };

  const saveSessions = (sessions: ExamSession[]) => {
    setExamSessions(sessions);
    localStorage.setItem("examSessions", JSON.stringify(sessions));
  };

  const addQuestion = () => {
    if (!newQuestion.subject.trim() || !newQuestion.question.trim()) {
      toast.error("Preencha a matéria e a pergunta");
      return;
    }

    const filledOptions = newQuestion.options.filter(opt => opt.trim());
    if (filledOptions.length < 2) {
      toast.error("Adicione pelo menos 2 opções");
      return;
    }

    const question: Question = {
      id: Date.now().toString(),
      subject: newQuestion.subject,
      question: newQuestion.question,
      options: filledOptions,
      correctAnswer: newQuestion.correctAnswer,
      explanation: newQuestion.explanation,
    };

    saveQuestions([...questions, question]);
    setNewQuestion({
      subject: "",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    });
    toast.success("Questão adicionada!");
  };

  const deleteQuestion = (id: string) => {
    saveQuestions(questions.filter(q => q.id !== id));
    toast.success("Questão removida");
  };

  const startExam = () => {
    if (questions.length === 0) {
      toast.error("Adicione questões primeiro");
      return;
    }

    const exam: ExamSession = {
      id: Date.now().toString(),
      title: `Simulado ${new Date().toLocaleDateString("pt-BR")}`,
      questions: [...questions].sort(() => Math.random() - 0.5).slice(0, Math.min(questions.length, 20)),
      startTime: new Date().toISOString(),
      answers: Array(Math.min(questions.length, 20)).fill(null),
    };

    setCurrentExam(exam);
    setCurrentQuestionIndex(0);
    setExamMode(true);
    setShowResults(false);
  };

  const answerQuestion = (answerIndex: number) => {
    if (!currentExam) return;

    const updatedAnswers = [...currentExam.answers];
    updatedAnswers[currentQuestionIndex] = answerIndex;

    setCurrentExam({
      ...currentExam,
      answers: updatedAnswers,
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < (currentExam?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishExam = () => {
    if (!currentExam) return;

    const unanswered = currentExam.answers.filter(a => a === null).length;
    if (unanswered > 0) {
      const confirm = window.confirm(
        `Você tem ${unanswered} questão(ões) não respondida(s). Deseja finalizar mesmo assim?`
      );
      if (!confirm) return;
    }

    const correctAnswers = currentExam.questions.reduce((count, question, index) => {
      return count + (currentExam.answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    const score = Math.round((correctAnswers / currentExam.questions.length) * 100);

    const finishedExam: ExamSession = {
      ...currentExam,
      endTime: new Date().toISOString(),
      score,
    };

    saveSessions([finishedExam, ...examSessions]);
    setCurrentExam(finishedExam);
    setShowResults(true);
    toast.success(`Simulado finalizado! Nota: ${score}%`);
  };

  const exitExam = () => {
    setExamMode(false);
    setCurrentExam(null);
    setCurrentQuestionIndex(0);
    setShowResults(false);
  };

  const stats = {
    totalQuestions: questions.length,
    completedExams: examSessions.length,
    averageScore: examSessions.length > 0
      ? Math.round(examSessions.reduce((sum, s) => sum + (s.score || 0), 0) / examSessions.length)
      : 0,
  };

  if (examMode && currentExam && !showResults) {
    const currentQuestion = currentExam.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentExam.questions.length) * 100;
    const selectedAnswer = currentExam.answers[currentQuestionIndex];

    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">
              Questão {currentQuestionIndex + 1} de {currentExam.questions.length}
            </h2>
            <Button variant="outline" size="sm" onClick={exitExam}>
              Sair
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="p-8">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              {currentQuestion.subject}
            </span>
            <p className="text-lg font-semibold leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(value) => answerQuestion(parseInt(value))}
          >
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <Label
                  key={index}
                  htmlFor={`option-${index}`}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-colors hover:bg-muted [&:has(:checked)]:border-primary"
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mt-1" />
                  <span className="flex-1">{option}</span>
                </Label>
              ))}
            </div>
          </RadioGroup>

          <div className="flex gap-3 mt-8">
            <Button
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="flex-1"
            >
              Anterior
            </Button>
            {currentQuestionIndex === currentExam.questions.length - 1 ? (
              <Button onClick={finishExam} className="flex-1">
                Finalizar Simulado
              </Button>
            ) : (
              <Button onClick={nextQuestion} className="flex-1">
                Próxima
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (showResults && currentExam) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Card className="p-8 mb-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Simulado Finalizado!</h2>
            <p className="text-muted-foreground">Confira seu desempenho</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <p className="text-3xl font-bold text-primary">{currentExam.score}%</p>
              <p className="text-sm text-muted-foreground">Nota Final</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/10">
              <p className="text-3xl font-bold text-green-600">
                {currentExam.questions.filter((q, i) => currentExam.answers[i] === q.correctAnswer).length}
              </p>
              <p className="text-sm text-muted-foreground">Acertos</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-destructive/10">
              <p className="text-3xl font-bold text-destructive">
                {currentExam.questions.filter((q, i) => currentExam.answers[i] !== q.correctAnswer && currentExam.answers[i] !== null).length}
              </p>
              <p className="text-sm text-muted-foreground">Erros</p>
            </div>
          </div>

          <Button onClick={exitExam} className="w-full" size="lg">
            Voltar ao Início
          </Button>
        </Card>

        <h3 className="text-xl font-semibold mb-4">Gabarito</h3>
        <div className="space-y-4">
          {currentExam.questions.map((question, index) => {
            const userAnswer = currentExam.answers[index];
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <Card key={question.id} className="p-6">
                <div className="flex items-start gap-4">
                  {isCorrect ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">Questão {index + 1}</span>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                        {question.subject}
                      </span>
                    </div>
                    <p className="mb-3">{question.question}</p>
                    <div className="space-y-2 mb-2">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-2 rounded ${
                            optIndex === question.correctAnswer
                              ? "bg-green-500/10 border border-green-500"
                              : optIndex === userAnswer && !isCorrect
                              ? "bg-destructive/10 border border-destructive"
                              : "bg-muted"
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                    {question.explanation && (
                      <div className="mt-3 p-3 bg-muted rounded">
                        <p className="text-sm">
                          <span className="font-semibold">Explicação: </span>
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Simulados</h1>
        <p className="text-muted-foreground">
          Crie questões e pratique com simulados
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Questões</p>
              <p className="text-2xl font-bold">{stats.totalQuestions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-secondary/10 p-3">
              <Clock className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Simulados</p>
              <p className="text-2xl font-bold">{stats.completedExams}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-accent/10 p-3">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Média</p>
              <p className="text-2xl font-bold">{stats.averageScore}%</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Criar Questões</TabsTrigger>
          <TabsTrigger value="questions">Minhas Questões</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Criar Nova Questão</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Matéria</Label>
                <Input
                  id="subject"
                  placeholder="Ex: Anatomia"
                  value={newQuestion.subject}
                  onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="question">Pergunta</Label>
                <Textarea
                  id="question"
                  placeholder="Ex: Qual é a função do coração?"
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  className="mt-2 min-h-24"
                />
              </div>
              <div>
                <Label>Opções de Resposta</Label>
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="mt-2 flex items-center gap-2">
                    <RadioGroup
                      value={newQuestion.correctAnswer.toString()}
                      onValueChange={(value) => setNewQuestion({ ...newQuestion, correctAnswer: parseInt(value) })}
                    >
                      <RadioGroupItem value={index.toString()} id={`correct-${index}`} />
                    </RadioGroup>
                    <Input
                      placeholder={`Opção ${index + 1}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...newQuestion.options];
                        newOptions[index] = e.target.value;
                        setNewQuestion({ ...newQuestion, options: newOptions });
                      }}
                    />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2">
                  Selecione a opção correta
                </p>
              </div>
              <div>
                <Label htmlFor="explanation">Explicação (opcional)</Label>
                <Textarea
                  id="explanation"
                  placeholder="Explique por que essa é a resposta correta"
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                  className="mt-2"
                />
              </div>
              <Button onClick={addQuestion} className="w-full" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Adicionar Questão
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          {questions.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                Nenhuma questão ainda
              </h3>
              <p className="text-muted-foreground mb-6">
                Crie sua primeira questão para começar
              </p>
            </Card>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <Button onClick={startExam} size="lg">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Iniciar Simulado
                </Button>
              </div>

              <div className="space-y-4">
                {questions.map((question) => (
                  <Card key={question.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                          {question.subject}
                        </span>
                        <p className="font-semibold mt-2 mb-3">{question.question}</p>
                        <div className="space-y-1 text-sm">
                          {question.options.map((option, index) => (
                            <div
                              key={index}
                              className={`p-2 rounded ${
                                index === question.correctAnswer
                                  ? "bg-green-500/10 text-green-700 font-medium"
                                  : "bg-muted"
                              }`}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {examSessions.length === 0 ? (
            <Card className="p-12 text-center">
              <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                Nenhum simulado realizado
              </h3>
              <p className="text-muted-foreground">
                Complete seu primeiro simulado para ver o histórico
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {examSessions.map((session) => (
                <Card key={session.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">{session.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.startTime).toLocaleString("pt-BR")} • {session.questions.length} questões
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{session.score}%</p>
                      <p className="text-xs text-muted-foreground">Nota Final</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PracticePage;
