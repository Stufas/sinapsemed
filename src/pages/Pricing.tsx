import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const plans = [
  {
    name: "Basic",
    price: "29,90",
    priceId: "price_basic", // TODO: Replace with actual Stripe price ID
    features: [
      "Cronogramas adaptativos com IA",
      "Até 100 flashcards por mês",
      "Calendário inteligente",
      "Análise básica de desempenho",
      "Acesso à comunidade",
    ],
  },
  {
    name: "Plus",
    price: "39,90",
    priceId: "price_plus", // TODO: Replace with actual Stripe price ID
    popular: true,
    features: [
      "Tudo do plano Basic",
      "Flashcards ilimitados",
      "Questões e simulados personalizados",
      "Análise avançada de desempenho",
      "Timer Pomodoro",
      "Suporte prioritário",
    ],
  },
  {
    name: "Pro",
    price: "49,90",
    priceId: "price_pro", // TODO: Replace with actual Stripe price ID
    features: [
      "Tudo do plano Plus",
      "IA ilimitada para geração de conteúdo",
      "Upload de documentos ilimitados",
      "Grupos de estudo privados",
      "Relatórios detalhados",
      "Consultoria personalizada",
    ],
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { user, createCheckoutSession } = useAuth();

  const handleSelectPlan = async (priceId: string, planName: string) => {
    if (!user) {
      toast.info("Faça login ou crie uma conta para continuar");
      navigate("/auth");
      return;
    }

    try {
      toast.loading("Preparando checkout...");
      await createCheckoutSession();
      toast.success("Redirecionando para o pagamento...");
    } catch (error) {
      toast.error("Erro ao iniciar checkout. Tente novamente.");
      console.error("Checkout error:", error);
    }
  };

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
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-3xl sm:text-4xl md:text-5xl font-bold">
              Escolha seu Plano
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Selecione o plano ideal para suas necessidades de estudo
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-6 sm:p-8 relative ${
                  plan.popular
                    ? "border-2 border-primary shadow-elevated scale-105"
                    : "border shadow-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Mais Popular
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">R$ {plan.price}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan.priceId, plan.name)}
                  className="w-full"
                  size="lg"
                  variant={plan.popular ? "default" : "outline"}
                >
                  Escolher {plan.name}
                </Button>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Todos os planos incluem 7 dias de teste grátis. Cancele quando quiser.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
