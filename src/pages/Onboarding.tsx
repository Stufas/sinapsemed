import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Stethoscope, Briefcase, ArrowRight } from "lucide-react";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState("");
  const navigate = useNavigate();

  const handleComplete = () => {
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

              <RadioGroup value={profile} onValueChange={setProfile}>
                <div className="space-y-3">
                  <Label
                    htmlFor="university"
                    className="flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-colors hover:bg-muted [&:has(:checked)]:border-primary"
                  >
                    <RadioGroupItem value="university" id="university" />
                    <div className="flex flex-1 items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-3">
                        <GraduationCap className="h-6 w-6 text-primary" />
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
                      <div className="rounded-full bg-secondary/10 p-3">
                        <Stethoscope className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <p className="font-semibold">Médico Residente</p>
                        <p className="text-sm text-muted-foreground">
                          Preparação para residência médica
                        </p>
                      </div>
                    </div>
                  </Label>

                  <Label
                    htmlFor="public-service"
                    className="flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-colors hover:bg-muted [&:has(:checked)]:border-primary"
                  >
                    <RadioGroupItem value="public-service" id="public-service" />
                    <div className="flex flex-1 items-center gap-3">
                      <div className="rounded-full bg-accent/10 p-3">
                        <Briefcase className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold">Concurseiro</p>
                        <p className="text-sm text-muted-foreground">
                          Preparação para concursos públicos
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              <Button
                onClick={() => setStep(2)}
                disabled={!profile}
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
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" placeholder="Ex: Maria Silva" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="institution">Instituição</Label>
                  <Input
                    id="institution"
                    placeholder="Ex: Universidade Federal de São Paulo"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="course">Curso ou Área</Label>
                  <Input id="course" placeholder="Ex: Medicina" className="mt-2" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  Voltar
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
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
                <div className="flex gap-2">
                  <Input placeholder="Nome da matéria" />
                  <Button>Adicionar</Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span>Anatomia I</span>
                    <Button variant="ghost" size="sm">
                      Remover
                    </Button>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span>Fisiologia</span>
                    <Button variant="ghost" size="sm">
                      Remover
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                  Voltar
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1">
                  Continuar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 text-2xl font-bold">Datas de provas</h2>
                <p className="text-muted-foreground">
                  Adicione as datas das suas próximas avaliações
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input type="date" className="flex-1" />
                  <Input placeholder="Matéria" className="flex-1" />
                  <Button>Adicionar</Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">Anatomia I</p>
                      <p className="text-sm text-muted-foreground">25/10/2025</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Remover
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(3)} variant="outline" className="flex-1">
                  Voltar
                </Button>
                <Button onClick={handleComplete} className="flex-1">
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
