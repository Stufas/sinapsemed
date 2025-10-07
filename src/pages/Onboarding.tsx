import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Stethoscope, Briefcase, ArrowRight, X, Calendar as CalendarIcon, Target } from "lucide-react";
import { toast } from "sonner";

interface Subject {
  id: string;
  name: string;
  semester?: string;
}

interface Exam {
  id: string;
  subject: string;
  date: string;
  type: string;
}

interface OnboardingData {
  profile: string;
  name: string;
  gender: string;
  pronoun: string;
  institution: string;
  course: string;
  semester: string;
  subjects: Subject[];
  exams: Exam[];
  studyHours: string;
  preferences: string;
}

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    profile: "",
    name: "",
    gender: "",
    pronoun: "",
    institution: "",
    course: "",
    semester: "",
    subjects: [],
    exams: [],
    studyHours: "",
    preferences: "",
  });
  
  const [currentSubject, setCurrentSubject] = useState("");
  const [currentSubjectSemester, setCurrentSubjectSemester] = useState("");
  const [currentExamSubject, setCurrentExamSubject] = useState("");
  const [currentExamDate, setCurrentExamDate] = useState("");
  const [currentExamType, setCurrentExamType] = useState("Prova");
  
  const navigate = useNavigate();

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const addSubject = () => {
    if (!currentSubject.trim()) {
      toast.error("Digite o nome da matéria");
      return;
    }
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: currentSubject,
      semester: currentSubjectSemester,
    };
    updateData("subjects", [...data.subjects, newSubject]);
    setCurrentSubject("");
    setCurrentSubjectSemester("");
    toast.success("Matéria adicionada!");
  };

  const removeSubject = (id: string) => {
    updateData("subjects", data.subjects.filter(s => s.id !== id));
  };

  const addExam = () => {
    if (!currentExamSubject.trim() || !currentExamDate) {
      toast.error("Preencha todos os campos");
      return;
    }
    const newExam: Exam = {
      id: Date.now().toString(),
      subject: currentExamSubject,
      date: currentExamDate,
      type: currentExamType,
    };
    updateData("exams", [...data.exams, newExam]);
    setCurrentExamSubject("");
    setCurrentExamDate("");
    setCurrentExamType("Prova");
    toast.success("Avaliação adicionada!");
  };

  const removeExam = (id: string) => {
    updateData("exams", data.exams.filter(e => e.id !== id));
  };

  const canProceedStep1 = data.profile !== "";
  const canProceedStep2 = data.profile === "pre-med" 
    ? data.name.trim() && data.gender.trim() && data.course.trim()
    : data.name.trim() && data.gender.trim() && data.institution.trim() && data.course.trim();
  const canProceedStep3 = data.subjects.length > 0;
  const canComplete = data.exams.length > 0 && data.studyHours;

  const handleComplete = () => {
    console.log("Onboarding data:", data);
    localStorage.setItem("userProfile", JSON.stringify(data));
    toast.success("Perfil criado com sucesso!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Bem-vindo! 🎉</h1>
          <p className="text-muted-foreground">
            Vamos personalizar sua experiência de estudos
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 w-12 rounded-full ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <Card className="p-8 shadow-elevated">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 text-2xl font-bold">Qual é o seu perfil?</h2>
                <p className="text-muted-foreground">
                  Isso nos ajudará a personalizar o conteúdo para você
                </p>
              </div>

              <RadioGroup value={data.profile} onValueChange={(value) => updateData("profile", value)}>
                <div className="space-y-3">
                  <Label
                    htmlFor="pre-med"
                    className="flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-colors hover:bg-muted [&:has(:checked)]:border-primary"
                  >
                    <RadioGroupItem value="pre-med" id="pre-med" />
                    <div className="flex flex-1 items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-3">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Futuro Médico</p>
                        <p className="text-sm text-muted-foreground">
                          Para você que está estudando para faculdade de medicina
                        </p>
                      </div>
                    </div>
                  </Label>

                  <Label
                    htmlFor="university"
                    className="flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-colors hover:bg-muted [&:has(:checked)]:border-primary"
                  >
                    <RadioGroupItem value="university" id="university" />
                    <div className="flex flex-1 items-center gap-3">
                      <div className="rounded-full bg-secondary/10 p-3">
                        <GraduationCap className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <p className="font-semibold">Universitário</p>
                        <p className="text-sm text-muted-foreground">
                          Estudante de graduação
                        </p>
                      </div>
                    </div>
                  </Label>

                  <Label
                    htmlFor="residency"
                    className="flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-colors hover:bg-muted [&:has(:checked)]:border-primary"
                  >
                    <RadioGroupItem value="residency" id="residency" />
                    <div className="flex flex-1 items-center gap-3">
                      <div className="rounded-full bg-accent/10 p-3">
                        <Stethoscope className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold">Futuro Residente</p>
                        <p className="text-sm text-muted-foreground">
                          Preparação para residência médica
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="w-full"
                size="lg"
              >
                Continuar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 text-2xl font-bold">Sobre você</h2>
                <p className="text-muted-foreground">
                  Conte-nos um pouco mais para personalizarmos sua experiência
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input 
                    id="name" 
                    placeholder="Ex: Maria Silva" 
                    className="mt-2"
                    value={data.name}
                    onChange={(e) => updateData("name", e.target.value)}
                  />
                </div>
                {data.profile !== "pre-med" && (
                  <div>
                    <Label htmlFor="institution">Instituição *</Label>
                    <Input
                      id="institution"
                      placeholder="Ex: Universidade Federal de São Paulo"
                      className="mt-2"
                      value={data.institution}
                      onChange={(e) => updateData("institution", e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="course">Curso ou Área *</Label>
                  <Input 
                    id="course" 
                    placeholder="Ex: Medicina" 
                    className="mt-2"
                    value={data.course}
                    onChange={(e) => updateData("course", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Sexo *</Label>
                  <select
                    id="gender"
                    className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={data.gender}
                    onChange={(e) => updateData("gender", e.target.value)}
                  >
                    <option value="">Selecione</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="pronoun">Pronome preferido (opcional)</Label>
                  <Input 
                    id="pronoun" 
                    placeholder="Ex: ele/dele, ela/dela, elu/delu" 
                    className="mt-2"
                    value={data.pronoun}
                    onChange={(e) => updateData("pronoun", e.target.value)}
                  />
                </div>
                {data.profile !== "pre-med" && (
                  <div>
                    <Label htmlFor="semester">Período/Semestre (opcional)</Label>
                    <Input 
                      id="semester" 
                      placeholder="Ex: 3º semestre" 
                      className="mt-2"
                      value={data.semester}
                      onChange={(e) => updateData("semester", e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  Voltar
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  className="flex-1"
                  disabled={!canProceedStep2}
                >
                  Continuar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 text-2xl font-bold">Suas matérias</h2>
                <p className="text-muted-foreground">
                  Adicione as matérias que você está estudando
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                  <Input 
                    placeholder="Nome da matéria" 
                    value={currentSubject}
                    onChange={(e) => setCurrentSubject(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSubject()}
                  />
                  <Input 
                    placeholder="Período (opcional)" 
                    value={currentSubjectSemester}
                    onChange={(e) => setCurrentSubjectSemester(e.target.value)}
                    className="w-32"
                  />
                  <Button onClick={addSubject} type="button">
                    Adicionar
                  </Button>
                </div>
                
                {data.subjects.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    Adicione pelo menos uma matéria para continuar
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <span className="font-medium">{subject.name}</span>
                          {subject.semester && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              ({subject.semester})
                            </span>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeSubject(subject.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                  Voltar
                </Button>
                <Button 
                  onClick={() => setStep(4)} 
                  className="flex-1"
                  disabled={!canProceedStep3}
                >
                  Continuar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 text-2xl font-bold">Configurações finais</h2>
                <p className="text-muted-foreground">
                  Adicione datas de avaliações e preferências de estudo
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block font-semibold">Avaliações</Label>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
                    <Input 
                      type="date" 
                      value={currentExamDate}
                      onChange={(e) => setCurrentExamDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <select
                      className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[150px]"
                      value={currentExamSubject}
                      onChange={(e) => setCurrentExamSubject(e.target.value)}
                    >
                      <option value="">Selecione a matéria</option>
                      {data.subjects.map((subject) => (
                        <option key={subject.id} value={subject.name}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={currentExamType}
                      onChange={(e) => setCurrentExamType(e.target.value)}
                    >
                      <option value="Prova">Prova</option>
                      <option value="Trabalho">Trabalho</option>
                      <option value="Seminário">Seminário</option>
                      <option value="Projeto">Projeto</option>
                    </select>
                    <Button onClick={addExam} type="button">
                      Adicionar
                    </Button>
                  </div>
                  
                  {data.exams.length === 0 ? (
                    <div className="mt-2 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                      Adicione pelo menos uma avaliação
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {data.exams.map((exam) => (
                        <div key={exam.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <p className="font-medium">{exam.subject}</p>
                              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                {exam.type}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {new Date(exam.date + "T00:00").toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric"
                              })}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeExam(exam.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="studyHours" className="mb-2 block font-semibold">
                    Horas disponíveis por dia *
                  </Label>
                  <Input 
                    id="studyHours"
                    type="number"
                    min="1"
                    max="24"
                    placeholder="Ex: 4"
                    value={data.studyHours}
                    onChange={(e) => updateData("studyHours", e.target.value)}
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    Quantas horas você pode dedicar aos estudos por dia?
                  </p>
                </div>

                <div>
                  <Label htmlFor="preferences" className="mb-2 block font-semibold">
                    Preferências de estudo (opcional)
                  </Label>
                  <Textarea
                    id="preferences"
                    placeholder="Ex: Prefiro estudar pela manhã, gosto de fazer resumos, tenho dificuldade com gráficos..."
                    className="min-h-24"
                    value={data.preferences}
                    onChange={(e) => updateData("preferences", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(3)} variant="outline" className="flex-1">
                  Voltar
                </Button>
                <Button 
                  onClick={handleComplete} 
                  className="flex-1"
                  disabled={!canComplete}
                >
                  Finalizar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
