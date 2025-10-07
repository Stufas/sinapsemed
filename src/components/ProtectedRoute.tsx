import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { subscription, createCheckoutSession, loading } = useAuth();

  const handleSubscribe = async () => {
    try {
      await createCheckoutSession();
      toast.success("Redirecionando para o pagamento...");
    } catch (error) {
      toast.error("Erro ao iniciar checkout. Tente novamente.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!subscription?.subscribed) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md p-8 text-center">
          <div className="mb-6 inline-flex rounded-full bg-primary/10 p-4">
            <Lock className="h-12 w-12 text-primary" />
          </div>
          
          <h2 className="mb-3 text-2xl font-bold">Conteúdo Premium</h2>
          
          <p className="mb-6 text-muted-foreground">
            Esta funcionalidade está disponível apenas para assinantes. 
            Assine agora e tenha acesso completo a todos os recursos da plataforma!
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4 text-primary" />
              <span>IA ilimitada para cronogramas e flashcards</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4 text-primary" />
              <span>Questões e simulados personalizados</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4 text-primary" />
              <span>Calendário inteligente sincronizado</span>
            </div>
          </div>

          <Button 
            onClick={handleSubscribe}
            size="lg"
            className="w-full"
          >
            <Crown className="mr-2 h-5 w-5" />
            Assinar por R$ 29,90/mês
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
