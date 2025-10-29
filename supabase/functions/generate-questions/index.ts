import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify subscription before processing
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check subscription status
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "Service configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: userData.user.email, limit: 1 });
    
    let hasActiveSubscription = false;
    if (customers.data.length > 0) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customers.data[0].id,
        status: "active",
        limit: 1,
      });
      hasActiveSubscription = subscriptions.data.length > 0;
    }

    if (!hasActiveSubscription) {
      return new Response(JSON.stringify({ error: "Active subscription required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    
    // Validate input with Zod
    const inputSchema = z.object({
      documentText: z.string().min(1, "Document text is required").max(10240, "Document text too large (max 10KB)"),
      subject: z.string().min(1, "Subject is required").max(100, "Subject too long (max 100 chars)"),
      count: z.number().int().min(1, "Count must be at least 1").max(50, "Count cannot exceed 50").default(5),
    });

    const validationResult = inputSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validationResult.error.errors }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { documentText, subject, count } = validationResult.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    console.log("Gerando questões para o documento...");

    const systemPrompt = `Você é um assistente especializado em criar questões de múltipla escolha para estudantes de medicina.
Baseado no texto fornecido, crie ${count} questões de alta qualidade que testem o conhecimento do aluno.

Para cada questão, forneça:
- Uma pergunta clara e objetiva
- 4 opções de resposta (A, B, C, D)
- A resposta correta (índice 0-3)
- Uma explicação breve da resposta

Retorne APENAS um JSON válido no seguinte formato:
{
  "questions": [
    {
      "question": "texto da pergunta",
      "options": ["opção A", "opção B", "opção C", "opção D"],
      "correctAnswer": 0,
      "explanation": "explicação da resposta"
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

    const questions = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(questions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao gerar questões:', error);
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
