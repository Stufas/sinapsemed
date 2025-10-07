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
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, signIn, user, onboardingCompleted } = useAuth();

  // Redirect if already logged in
  if (user && onboardingCompleted !== null) {
    navigate(onboardingCompleted ? "/dashboard" : "/onboarding");
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

      // Login successful - will be redirected by the useEffect in Auth component
      toast.success("Login realizado com sucesso!");
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = z.string().email({ message: "Email inválido" }).parse(email);
      setLoading(true);

      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.auth.resetPasswordForEmail(validated, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
      setIsForgotPassword(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao enviar email de recuperação");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-3 sm:p-4 shadow-lg">
              <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {isForgotPassword ? "Recuperar Senha" : isSignUp ? "Criar Conta" : "Bem-vindo"}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            {isForgotPassword
              ? "Digite seu email para recuperar sua senha"
              : isSignUp
              ? "Comece sua jornada de estudos hoje"
              : "Entre para continuar seus estudos"}
          </p>
        </div>

        <Card className="p-6 sm:p-8 shadow-xl border-border/50 backdrop-blur-sm bg-card/95 animate-fade-in">
          {!isForgotPassword && (
            <div className="flex gap-2 mb-6">
              <Button
                type="button"
                variant={!isSignUp ? "default" : "outline"}
                className="flex-1 h-11"
                onClick={() => {
                  setIsSignUp(false);
                  setPassword("");
                  setConfirmPassword("");
                }}
              >
                Login
              </Button>
              <Button
                type="button"
                variant={isSignUp ? "default" : "outline"}
                className="flex-1 h-11"
                onClick={() => {
                  setIsSignUp(true);
                  setPassword("");
                  setConfirmPassword("");
                }}
              >
                Criar Conta
              </Button>
            </div>
          )}
          <form 
            onSubmit={isForgotPassword ? handleForgotPassword : isSignUp ? handleSignUp : handleSignIn} 
            className="space-y-4 sm:space-y-5"
          >
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

            {!isForgotPassword && isSignUp && (
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

            {!isForgotPassword && (
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
            )}

            {!isForgotPassword && isSignUp && (
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

            {!isForgotPassword && !isSignUp && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Esqueceu a senha?
                </button>
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
                : isForgotPassword
                ? "Enviar Email"
                : isSignUp
                ? "Criar Conta"
                : "Entrar"}
            </Button>
          </form>

          {isForgotPassword && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Voltar para login
              </button>
            </div>
          )}
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
