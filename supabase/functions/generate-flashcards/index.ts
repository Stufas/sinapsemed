import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentText, subject, count = 10 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    console.log("Gerando flashcards para o documento...");

    const systemPrompt = `Você é um assistente especializado em criar flashcards para estudantes de medicina.
Baseado no texto fornecido, crie ${count} flashcards que ajudem o aluno a memorizar conceitos importantes.

Para cada flashcard, forneça:
- Uma pergunta ou conceito na frente (front)
- A resposta ou explicação no verso (back)

Os flashcards devem focar em:
- Definições importantes
- Conceitos-chave
- Relações entre tópicos
- Informações que requerem memorização

Retorne APENAS um JSON válido no seguinte formato:
{
  "flashcards": [
    {
      "front": "pergunta ou conceito",
      "back": "resposta ou explicação"
    }
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Matéria: ${subject}\n\nTexto do documento:\n${documentText.substring(0, 10000)}` 
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro da API AI:", response.status, errorText);
      throw new Error(`Erro ao chamar API AI: ${response.status}`);
    }

    const data = await response.json();
    console.log("Resposta da IA recebida");
    
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    // Parse JSON da resposta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Formato de resposta inválido");
    }

    const flashcards = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(flashcards), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao gerar flashcards:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro desconhecido" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
