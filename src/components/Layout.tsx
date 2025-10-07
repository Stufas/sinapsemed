import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Calendar, 
  Brain, 
  BookOpen, 
  Target,
  HelpCircle,
  CalendarDays,
  Timer,
  MessageSquare, 
  Users,
  Settings,
  Crown,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { subscription, createCheckoutSession } = useAuth();
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", premium: false },
    { to: "/calendar", icon: Calendar, label: "Calendário", premium: false },
    { to: "/schedule", icon: CalendarDays, label: "Cronograma", premium: false },
    { to: "/timer", icon: Timer, label: "Cronômetro", premium: false },
    { to: "/flashcards", icon: Brain, label: "Flashcards", premium: false },
    { to: "/practice", icon: Target, label: "Simulados", premium: false },
    { to: "/questions", icon: HelpCircle, label: "Questões", premium: false },
    { to: "/content", icon: BookOpen, label: "Conteúdo", premium: false },
    { to: "/chat", icon: MessageSquare, label: "Assistente IA", premium: false },
    { to: "/community", icon: Users, label: "Comunidade", premium: false },
  ];

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const handleSubscribe = async () => {
    try {
      await createCheckoutSession();
      toast.success("Redirecionando para o pagamento...");
      setShowSubscribeDialog(false);
    } catch (error) {
      toast.error("Erro ao iniciar checkout. Tente novamente.");
    }
  };

  const NavContent = () => (
    <>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.to}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
              onClick={handleNavClick}
            >
              <Link to={item.to}>
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="border-t p-4 space-y-1">
        <Button variant="ghost" className="w-full justify-start" asChild onClick={handleNavClick}>
          <Link to="/settings">
            <Settings className="mr-3 h-5 w-5" />
            Configurações
          </Link>
        </Button>
        
        {subscription?.subscribed && (
          <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
            <Crown className="h-3 w-3 text-primary" />
            Plano Ativo
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b bg-background h-16 flex items-center px-4">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-4">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              <div className="border-b p-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2" onClick={handleNavClick}>
                  <div className="rounded-lg bg-gradient-primary p-2">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">Sinapse Med</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <NavContent />
            </div>
          </SheetContent>
        </Sheet>
        
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-lg bg-gradient-primary p-2">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold">Sinapse Med</span>
        </Link>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex sticky top-0 h-screen w-64 border-r bg-sidebar flex-col">
        <div className="border-b p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-primary p-2">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">Sinapse Med</span>
          </Link>
        </div>
        <NavContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Subscribe Dialog */}
      <AlertDialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Crown className="h-8 w-8 text-primary" />
              </div>
            </div>
            <AlertDialogTitle className="text-center text-2xl">
              Assine para usar este recurso
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Esta funcionalidade está disponível apenas para assinantes. 
              Por apenas R$ 29,90/mês você terá acesso completo a:
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-3 my-4">
            <div className="flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4 text-primary flex-shrink-0" />
              <span>IA ilimitada para cronogramas e flashcards</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Questões e simulados personalizados</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Calendário inteligente sincronizado</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Comunidade e grupos de estudo</span>
            </div>
          </div>

          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-0">Agora não</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubscribe}>
              <Crown className="mr-2 h-4 w-4" />
              Sim, quero assinar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Layout;
