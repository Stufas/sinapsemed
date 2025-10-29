import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import CalendarPage from "./pages/CalendarPage";
import FlashcardsPage from "./pages/FlashcardsPage";

import QuestionsPage from "./pages/QuestionsPage";
import ContentPage from "./pages/ContentPage";
import TimerPage from "./pages/TimerPage";
import SchedulePage from "./pages/SchedulePage";
import Community from "./pages/Community";
import Demo from "./pages/Demo";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/calendar" element={<Layout><CalendarPage /></Layout>} />
          <Route path="/flashcards" element={<Layout><FlashcardsPage /></Layout>} />
          <Route path="/questions" element={<Layout><QuestionsPage /></Layout>} />
          <Route path="/schedule" element={<Layout><SchedulePage /></Layout>} />
          <Route path="/content" element={<Layout><ContentPage /></Layout>} />
          <Route path="/timer" element={<Layout><TimerPage /></Layout>} />
        <Route path="/chat" element={<Layout><div className="text-center text-muted-foreground">Em breve...</div></Layout>} />
        <Route path="/community" element={<Layout><Community /></Layout>} />
        <Route path="/settings" element={<Layout><div className="text-center text-muted-foreground">Em breve...</div></Layout>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
