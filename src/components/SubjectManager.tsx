import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, BookOpen, Edit2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const subjectSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  color: z.string().optional()
});

interface Subject {
  id: string;
  name: string;
  color: string | null;
}

interface SubjectManagerProps {
  onSubjectsChange?: () => void;
  showAddButton?: boolean;
  compact?: boolean;
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#84cc16", // lime
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#64748b", // slate
];

export const SubjectManager = ({ onSubjectsChange, showAddButton = true, compact = false }: SubjectManagerProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    color: PRESET_COLORS[0]
  });

  useEffect(() => {
    loadSubjects();
  }, []);

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
      toast({
        title: "Erro",
        description: "Não foi possível carregar as matérias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = subjectSchema.parse(formData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado",
          variant: "destructive"
        });
        return;
      }

      if (editingSubject) {
        // Update existing subject
        const { error } = await supabase
          .from("subjects")
          .update({
            name: validatedData.name,
            color: formData.color
          })
          .eq("id", editingSubject.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Matéria atualizada"
        });
      } else {
        // Create new subject
        const { error } = await supabase
          .from("subjects")
          .insert({
            user_id: user.id,
            name: validatedData.name,
            color: formData.color
          });

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Matéria adicionada"
        });
      }

      setFormData({ name: "", color: PRESET_COLORS[0] });
      setEditingSubject(null);
      setDialogOpen(false);
      await loadSubjects();
      onSubjectsChange?.();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else {
        console.error("Error saving subject:", error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar a matéria",
          variant: "destructive"
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Matéria removida"
      });

      await loadSubjects();
      onSubjectsChange?.();
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a matéria",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      color: subject.color || PRESET_COLORS[0]
    });
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingSubject(null);
      setFormData({ name: "", color: PRESET_COLORS[0] });
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Carregando matérias...</div>;
  }

  return (
    <div className="space-y-4">
      {showAddButton && (
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="w-full" size={compact ? "sm" : "default"}>
              <Plus className="mr-2 h-4 w-4" />
              {compact ? "Nova Matéria" : "Adicionar Matéria"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSubject ? "Editar Matéria" : "Nova Matéria"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject-name">Nome da Matéria *</Label>
                <Input
                  id="subject-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Anatomia, Fisiologia"
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Cor (opcional)</Label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`h-10 w-full rounded-md border-2 transition-all ${
                        formData.color === color ? "border-primary ring-2 ring-primary ring-offset-2" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingSubject ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {subjects.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Nenhuma matéria cadastrada. {showAddButton && "Adicione sua primeira matéria!"}
        </div>
      ) : (
        <div className="space-y-2">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className={`flex items-center justify-between rounded-lg border ${compact ? "p-2" : "p-3"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: subject.color || "#64748b" }}
                >
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <span className={`font-medium ${compact ? "text-sm" : ""}`}>{subject.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEdit(subject)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleDelete(subject.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
