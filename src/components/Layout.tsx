import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Calendar, 
  Brain, 
  BookOpen, 
  Target,
  HelpCircle,
  Timer,
  MessageSquare, 
  Users,
  Settings
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/calendar", icon: Calendar, label: "Calendário" },
    { to: "/timer", icon: Timer, label: "Cronômetro" },
    { to: "/flashcards", icon: Brain, label: "Flashcards" },
    { to: "/practice", icon: Target, label: "Simulados" },
    { to: "/questions", icon: HelpCircle, label: "Questões" },
    { to: "/content", icon: BookOpen, label: "Conteúdo" },
    { to: "/chat", icon: MessageSquare, label: "Assistente IA" },
    { to: "/community", icon: Users, label: "Comunidade" },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-64 border-r bg-sidebar">
        <div className="flex h-full flex-col">
          <div className="border-b p-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-primary p-2">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Sinapse Med</span>
            </Link>
          </div>

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
                >
                  <Link to={item.to}>
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>

          <div className="border-t p-4">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/settings">
                <Settings className="mr-3 h-5 w-5" />
                Configurações
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
