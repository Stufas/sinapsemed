import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Trash2, Loader2, Sparkles, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Document {
  id: string;
  title: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
  content_text: string | null;
}

const ContentPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast.error('Erro ao carregar documentos');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Apenas arquivos PDF são aceitos');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile || !subject.trim()) {
      toast.error('Selecione um arquivo e preencha a matéria');
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Upload do arquivo
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Registrar no banco
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: `${subject} - ${selectedFile.name}`,
          file_path: filePath,
          file_size: selectedFile.size,
        });

      if (dbError) throw dbError;

      toast.success('Documento enviado com sucesso!');
      setSelectedFile(null);
      setSubject("");
      loadDocuments();
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      toast.error('Erro ao enviar documento');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (doc: Document) => {
    try {
      // Deletar arquivo do storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Deletar registro do banco
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      toast.success('Documento removido');
      loadDocuments();
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      toast.error('Erro ao deletar documento');
    }
  };

  const extractTextFromPDF = async (filePath: string): Promise<string> => {
    // Download do arquivo
    const { data, error } = await supabase.storage
      .from('documents')
      .download(filePath);

    if (error) throw error;

    // Converter para texto usando FileReader
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Aqui seria ideal usar uma biblioteca de parse de PDF
        // Por simplicidade, vamos usar o texto básico
        const text = reader.result as string;
        resolve(text.substring(0, 15000)); // Limitar tamanho
      };
      reader.onerror = reject;
      reader.readAsText(data);
    });
  };

  const generateQuestions = async (doc: Document) => {
    setProcessing(doc.id);
    try {
      let documentText = doc.content_text;
      
      if (!documentText) {
        toast.info('Extraindo texto do PDF...');
        documentText = await extractTextFromPDF(doc.file_path);
      }

      toast.info('Gerando questões com IA...');
      
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: {
          documentText,
          subject: doc.title.split(' - ')[0],
          count: 5
        }
      });

      if (error) throw error;

      // Salvar questões no localStorage (poderia ser no banco)
      const savedQuestions = localStorage.getItem("practiceQuestions");
      const questions = savedQuestions ? JSON.parse(savedQuestions) : [];
      
      const newQuestions = data.questions.map((q: any) => ({
        id: Date.now().toString() + Math.random(),
        subject: doc.title.split(' - ')[0],
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: "medium",
        reviewCount: 0,
        correctCount: 0,
      }));

      localStorage.setItem("practiceQuestions", JSON.stringify([...questions, ...newQuestions]));
      
      toast.success(`${newQuestions.length} questões geradas!`);
    } catch (error) {
      console.error('Erro ao gerar questões:', error);
      toast.error('Erro ao gerar questões');
    } finally {
      setProcessing(null);
    }
  };

  const generateFlashcards = async (doc: Document) => {
    setProcessing(doc.id);
    try {
      let documentText = doc.content_text;
      
      if (!documentText) {
        toast.info('Extraindo texto do PDF...');
        documentText = await extractTextFromPDF(doc.file_path);
      }

      toast.info('Gerando flashcards com IA...');
      
      const { data, error } = await supabase.functions.invoke('generate-flashcards', {
        body: {
          documentText,
          subject: doc.title.split(' - ')[0],
          count: 10
        }
      });

      if (error) throw error;

      // Salvar flashcards no localStorage
      const savedCards = localStorage.getItem("flashcards");
      const cards = savedCards ? JSON.parse(savedCards) : [];
      
      const newCards = data.flashcards.map((fc: any) => ({
        id: Date.now().toString() + Math.random(),
        subject: doc.title.split(' - ')[0],
        front: fc.front,
        back: fc.back,
        difficulty: "medium",
        reviewCount: 0,
        correctCount: 0,
      }));

      localStorage.setItem("flashcards", JSON.stringify([...cards, ...newCards]));
      
      toast.success(`${newCards.length} flashcards gerados!`);
    } catch (error) {
      console.error('Erro ao gerar flashcards:', error);
      toast.error('Erro ao gerar flashcards');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Conteúdo de Estudo</h1>
        <p className="text-muted-foreground">
          Faça upload de PDFs e gere questões e flashcards automaticamente com IA
        </p>
      </div>

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Enviar Novo Documento</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="subject">Matéria</Label>
            <Input
              id="subject"
              placeholder="Ex: Anatomia"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="file">Arquivo PDF</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="mt-2"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground mt-2">
                Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          <Button 
            onClick={uploadDocument} 
            disabled={uploading || !selectedFile || !subject.trim()}
            className="w-full"
            size="lg"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Enviar Documento
              </>
            )}
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Meus Documentos</h2>
        {documents.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              Nenhum documento ainda
            </h3>
            <p className="text-muted-foreground">
              Faça upload do seu primeiro PDF para começar
            </p>
          </Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{doc.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enviado em {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')} •{' '}
                    {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => generateQuestions(doc)}
                      disabled={processing === doc.id}
                      size="sm"
                      variant="outline"
                    >
                      {processing === doc.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Gerar Questões
                    </Button>
                    <Button
                      onClick={() => generateFlashcards(doc)}
                      disabled={processing === doc.id}
                      size="sm"
                      variant="outline"
                    >
                      {processing === doc.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <BookOpen className="mr-2 h-4 w-4" />
                      )}
                      Gerar Flashcards
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteDocument(doc)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ContentPage;
