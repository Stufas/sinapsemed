import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const SubscriptionCard = () => {
  const { subscription, createCheckoutSession, openCustomerPortal } = useAuth();

  const handleSubscribe = async () => {
    try {
      await createCheckoutSession();
      toast.success("Redirecionando para o pagamento...");
    } catch (error) {
      toast.error("Erro ao iniciar checkout. Tente novamente.");
    }
  };

  const handleManage = async () => {
    try {
      await openCustomerPortal();
      toast.success("Abrindo portal de gerenciamento...");
    } catch (error) {
      toast.error("Erro ao abrir portal. Tente novamente.");
    }
  };

  if (subscription?.subscribed) {
    return (
      <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Plano Ativo</h3>
              <p className="text-sm text-muted-foreground">
                Renovação: {subscription.subscription_end ? new Date(subscription.subscription_end).toLocaleDateString('pt-BR') : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Você tem acesso completo a todos os recursos da plataforma.
        </p>

        <Button 
          onClick={handleManage} 
          variant="outline" 
          className="w-full"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Gerenciar Assinatura
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-2 border-dashed">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-muted rounded-lg">
          <CreditCard className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Teste Grátis</h3>
          <p className="text-sm text-muted-foreground">
            Assine por R$ 29,90/mês
          </p>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Desbloqueie todos os recursos premium:
      </p>

      <ul className="space-y-2 mb-6 text-sm">
        <li className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span>IA ilimitada para cronogramas e flashcards</span>
        </li>
        <li className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span>Questões e simulados personalizados</span>
        </li>
        <li className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span>Calendário inteligente sincronizado</span>
        </li>
        <li className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span>Comunidade e grupos de estudo</span>
        </li>
      </ul>

      <Button 
        asChild
        className="w-full"
        size="lg"
      >
        <Link to="/pricing">
          <Crown className="mr-2 h-4 w-4" />
          Assinar Agora
        </Link>
      </Button>
    </Card>
  );
};

export default SubscriptionCard;
