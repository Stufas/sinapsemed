import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import CalendarPage from "./pages/CalendarPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import PracticePage from "./pages/PracticePage";
import ContentPage from "./pages/ContentPage";
import Demo from "./pages/Demo";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/calendar" element={<Layout><CalendarPage /></Layout>} />
        <Route path="/flashcards" element={<Layout><FlashcardsPage /></Layout>} />
        <Route path="/practice" element={<Layout><PracticePage /></Layout>} />
        <Route path="/content" element={<Layout><ContentPage /></Layout>} />
        <Route path="/chat" element={<Layout><div className="text-center text-muted-foreground">Em breve...</div></Layout>} />
        <Route path="/community" element={<Layout><div className="text-center text-muted-foreground">Em breve...</div></Layout>} />
        <Route path="/settings" element={<Layout><div className="text-center text-muted-foreground">Em breve...</div></Layout>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
