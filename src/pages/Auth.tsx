import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
  confirmPassword: z.string(),
  phone: z.string().min(10, { message: "Telefone inválido" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "Senha é obrigatória" }),
});

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, signIn, user } = useAuth();

  // Redirect if already logged in
  if (user) {
    navigate("/onboarding");
    return null;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = signUpSchema.parse({ email, password, confirmPassword, phone });
      setLoading(true);

      const { error } = await signUp(validated.email, validated.password, validated.phone);

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Este email já está cadastrado. Faça login.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Conta criada com sucesso! Faça login para continuar.");
      setIsSignUp(false);
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        toast.error("Erro ao criar conta");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = signInSchema.parse({ email, password });
      setLoading(true);

      const { error } = await signIn(validated.email, validated.password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email ou senha incorretos");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Login realizado com sucesso!");
      navigate("/onboarding");
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        toast.error("Erro ao fazer login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-4 shadow-lg">
              <Brain className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {isSignUp ? "Criar Conta" : "Bem-vindo"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isSignUp
              ? "Comece sua jornada de estudos hoje"
              : "Entre para continuar seus estudos"}
          </p>
        </div>

        <Card className="p-8 shadow-xl border-border/50 backdrop-blur-sm bg-card/95 animate-fade-in">
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {isSignUp && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="phone" className="text-foreground font-medium">
                  Telefone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {isSignUp && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                  Confirmar Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              size="lg"
              disabled={loading}
            >
              {loading
                ? "Carregando..."
                : isSignUp
                ? "Criar Conta"
                : "Entrar"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setPassword("");
                setConfirmPassword("");
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              {isSignUp
                ? "Já tem uma conta? Faça login"
                : "Não tem uma conta? Cadastre-se"}
            </button>
          </div>
        </Card>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Ao continuar, você concorda com nossos{" "}
          <a href="#" className="text-primary hover:underline font-medium">
            Termos de Serviço
          </a>{" "}
          e{" "}
          <a href="#" className="text-primary hover:underline font-medium">
            Política de Privacidade
          </a>
        </p>
      </div>
    </div>
  );
};

export default Auth;
