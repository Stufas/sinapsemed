import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Clock } from "lucide-react";

interface DBSubject {
  id: string;
  name: string;
  color: string | null;
}

export interface StudySessionConfig {
  subjectId: string;
  subjectName: string;
  topic: string;
  notes?: string;
}

interface StudySessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (config: StudySessionConfig) => void;
  timerMode: string;
}

export const StudySessionDialog = ({ open, onOpenChange, onStart, timerMode }: StudySessionDialogProps) => {
  const [subjects, setSubjects] = useState<DBSubject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      loadSubjects();
    }
  }, [open]);

  const loadSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name");

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error("Error loading subjects:", error);
    }
  };

  const handleStart = () => {
    if (!selectedSubjectId || !topic.trim()) {
      return;
    }

    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
    if (!selectedSubject) return;

    onStart({
      subjectId: selectedSubjectId,
      subjectName: selectedSubject.name,
      topic: topic.trim(),
      notes: notes.trim() || undefined,
    });

    // Reset form
    setSelectedSubjectId("");
    setTopic("");
    setNotes("");
    onOpenChange(false);
  };

  const getModeName = () => {
    switch (timerMode) {
      case "pomodoro": return "Pomodoro (25min)";
      case "long-pomodoro": return "Pomodoro Longo (50min)";
      case "custom": return "Personalizado";
      default: return "Timer";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Configurar Sessão de Estudo
          </DialogTitle>
          <DialogDescription>
            Configure o que você vai estudar nesta sessão de {getModeName()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Matéria *</Label>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Selecione a matéria" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <div className="flex items-center gap-2">
                      {subject.color && (
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: subject.color }}
                        />
                      )}
                      {subject.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Assunto/Tópico *</Label>
            <Input
              id="topic"
              placeholder="Ex: Sistema Cardiovascular, Verbos Irregulares..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Seja específico sobre o que vai estudar nesta sessão
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Ex: Revisar capítulo 3, fazer exercícios..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Seus dados de estudo serão salvos automaticamente e você poderá acompanhar 
                seu progresso por matéria e assunto.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleStart}
            disabled={!selectedSubjectId || !topic.trim()}
          >
            Iniciar Timer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
