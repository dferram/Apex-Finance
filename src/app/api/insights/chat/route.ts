import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FinancialContext {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  weeklyExpense: number;
  categoryTotals: { category: string; amount: number }[];
  goals: { name: string; target: number; current: number; progress: number }[];
  apexScore: number;
  isProfessional: boolean;
  workspaceName: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json() as {
      messages: Message[];
      context: FinancialContext;
    };

    if (!process.env.GOOGLE_AI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Google AI API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // System prompt para Apex AI
    const systemPrompt = `Eres "Apex AI", un asesor financiero profesional, directo y analítico integrado en Apex Finance.

**TU PERSONALIDAD:**
- Profesional pero cercano, motivador pero realista
- Usas datos concretos para respaldar tus consejos
- Das recomendaciones accionables, no solo teoría
- Eres conciso: respuestas de 2-4 párrafos máximo
- Evitas jerga innecesaria, pero eres técnicamente preciso

**CONTEXTO FINANCIERO DEL USUARIO:**
- Workspace: ${context.workspaceName} (${context.isProfessional ? 'Profesional/Empresa' : 'Personal'})
- Balance Total: $${context.totalBalance.toLocaleString()}
- Ingresos Totales: $${context.totalIncome.toLocaleString()}
- Gastos Totales: $${context.totalExpense.toLocaleString()}
- Gasto Semanal: $${context.weeklyExpense.toLocaleString()}
- Apex Score: ${context.apexScore}/100

**CATEGORÍAS DE GASTO (Top 5):**
${context.categoryTotals.slice(0, 5).map(c => `- ${c.category}: $${c.amount.toLocaleString()}`).join('\n')}

**METAS FINANCIERAS:**
${context.goals.length > 0 
  ? context.goals.map(g => `- ${g.name}: $${g.current.toLocaleString()} / $${g.target.toLocaleString()} (${g.progress}%)`).join('\n')
  : '- Sin metas definidas'}

**TUS RESPONSABILIDADES:**
1. Analizar patrones de gasto y sugerir optimizaciones
2. Ayudar a establecer y alcanzar metas financieras
3. Identificar áreas de mejora en el flujo de efectivo
4. Proporcionar perspectivas sobre el Apex Score
5. Responder preguntas específicas sobre finanzas personales/empresariales

**REGLAS:**
- Siempre basa tus consejos en los datos reales del usuario
- Si el usuario pregunta algo fuera de finanzas, redirige amablemente al tema
- Usa emojis ocasionalmente para hacer la conversación más amigable (máximo 2 por mensaje)
- Si detectas patrones preocupantes, sé honesto pero constructivo
- Celebra los logros y progreso del usuario

Responde de manera conversacional, como un asesor financiero experto que conoce la situación del usuario.`;

    // Construir el historial de conversación
    const chatHistory = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Iniciar chat con historial
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'Entendido. Soy Apex AI, tu asesor financiero. He analizado tu situación financiera y estoy listo para ayudarte a optimizar tus finanzas. ¿En qué puedo asistirte hoy?' }],
        },
        ...chatHistory.slice(0, -1), // Excluir el último mensaje del usuario
      ],
    });

    // Obtener el último mensaje del usuario
    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // Generar respuesta con streaming
    const result = await chat.sendMessageStream(lastUserMessage);

    // Crear un stream de respuesta
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
