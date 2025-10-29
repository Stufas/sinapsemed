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
import { Brain, CheckCircle2, XCircle, Plus, Trash2, Target, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

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

interface Subject {
  id: string;
  name: string;
  color: string | null;
  user_id: string;
  created_at: string;
}

interface Document {
  id: string;
  title: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
  content_text: string | null;
  user_id: string;
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
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDocument, setSelectedDocument] = useState("");
  const [specificTopic, setSpecificTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("questions");
    if (saved) {
      setQuestions(JSON.parse(saved));
    }
    loadSubjects();
    loadDocuments();
  }, []);

  const loadSubjects = async () => {
    const { data } = await supabase.from('subjects').select('*').order('name');
    if (data) setSubjects(data);
  };

  const loadDocuments = async () => {
    const { data } = await supabase.from('documents').select('*').order('uploaded_at', { ascending: false });
    if (data) setDocuments(data);
  };

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

  const extractTextFromPDF = async (filePath: string): Promise<string> => {
    try {
      const { data, error } = await supabase.storage.from('documents').download(filePath);
      if (error) throw error;

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          resolve(text.substring(0, 15000));
        };
        reader.onerror = reject;
        reader.readAsText(data);
      });
    } catch (error) {
      console.error("Error extracting PDF text:", error);
      throw error;
    }
  };

  const generateQuestionsWithAI = async () => {
    if (!selectedDocument || !selectedSubject) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione uma matéria e um documento",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const doc = documents.find(d => d.id === selectedDocument);
      if (!doc) throw new Error("Documento não encontrado");

      let documentText = doc.content_text;
      if (!documentText) {
        toast({
          title: "Extraindo texto...",
          description: "Processando PDF"
        });
        documentText = await extractTextFromPDF(doc.file_path);
      }

      const prompt = specificTopic 
        ? `${documentText}\n\nFOCO ESPECÍFICO: Gere questões focadas em: ${specificTopic}`
        : documentText;

      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: {
          documentText: prompt,
          subject: subjects.find(s => s.id === selectedSubject)?.name || "",
          count: questionCount
        }
      });

      if (error) throw error;

      const newQuestions = data.questions.map((q: any) => ({
        id: Date.now().toString() + Math.random(),
        subject: subjects.find(s => s.id === selectedSubject)?.name || "",
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        answered: false,
        correct: undefined
      }));

      saveQuestions([...questions, ...newQuestions]);
      
      setSelectedSubject("");
      setSelectedDocument("");
      setSpecificTopic("");
      setQuestionCount(5);

      toast({
        title: "Sucesso!",
        description: `${newQuestions.length} questões geradas com IA`
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar questões",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const questionSubjects = Array.from(new Set(questions.map(q => q.subject)));
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
                      {questionSubjects.map(subject => (
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
                  <CardTitle>Gerar Questões com IA</CardTitle>
                  <CardDescription>Selecione um documento e deixe a IA criar questões para você</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Matéria *</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a matéria" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Documento PDF *</Label>
                    <Select value={selectedDocument} onValueChange={setSelectedDocument}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o PDF" />
                      </SelectTrigger>
                      <SelectContent>
                        {documents.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            Nenhum documento enviado ainda
                          </div>
                        ) : (
                          documents.map(doc => (
                            <SelectItem key={doc.id} value={doc.id}>
                              {doc.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {documents.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Envie PDFs na página de <Link to="/content" className="underline">Conteúdo</Link>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Assunto Específico (opcional)</Label>
                    <Input
                      placeholder="Ex: Sistema Cardiovascular, Anatomia do Coração..."
                      value={specificTopic}
                      onChange={(e) => setSpecificTopic(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Especifique um tema para focar as questões
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Quantidade de Questões</Label>
                    <Select 
                      value={questionCount.toString()} 
                      onValueChange={(v) => setQuestionCount(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 questões</SelectItem>
                        <SelectItem value="5">5 questões</SelectItem>
                        <SelectItem value="10">10 questões</SelectItem>
                        <SelectItem value="15">15 questões</SelectItem>
                        <SelectItem value="20">20 questões</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={generateQuestionsWithAI}
                    disabled={isGenerating || !selectedSubject || !selectedDocument}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando questões...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Gerar Questões com IA
                      </>
                    )}
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
