import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { chatRateLimiter, getClientIdentifier } from '@/lib/rateLimiter';

// Initialize Gemini AI with logging
const apiKey = process.env.GOOGLE_AI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Log Gemini API status
if (apiKey) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('GEMINI AI API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Status: Connected');
  console.log('API Key: ' + apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
  console.log('Model: gemini-2.5-flash');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
} else {
  console.log('WARNING: GOOGLE_AI_API_KEY not configured\n');
}

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
    // Check rate limit
    const clientId = getClientIdentifier(req);
    const rateLimitResult = chatRateLimiter.check(clientId);

    if (!rateLimitResult.allowed) {
      const resetIn = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          resetIn,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

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

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    // System prompt for Apex AI
    const systemPrompt = `You are "Apex AI", a professional, direct, and analytical financial advisor integrated into Apex Finance.

**YOUR PERSONALITY:**
- Professional yet approachable, motivating yet realistic
- Use concrete data to support your advice
- Provide actionable recommendations, not just theory
- Be concise: 2-4 paragraph responses maximum
- Avoid unnecessary jargon, but be technically precise

**USER'S FINANCIAL CONTEXT:**
- Workspace: ${context.workspaceName} (${context.isProfessional ? 'Professional/Business' : 'Personal'})
- Total Balance: $${context.totalBalance.toLocaleString()}
- Total Income: $${context.totalIncome.toLocaleString()}
- Total Expenses: $${context.totalExpense.toLocaleString()}
- Weekly Spending: $${context.weeklyExpense.toLocaleString()}
- Apex Score: ${context.apexScore}/100

**SPENDING CATEGORIES (Top 5):**
${context.categoryTotals.slice(0, 5).map(c => `- ${c.category}: $${c.amount.toLocaleString()}`).join('\n')}

**FINANCIAL GOALS:**
${context.goals.length > 0 
  ? context.goals.map(g => `- ${g.name}: $${g.current.toLocaleString()} / $${g.target.toLocaleString()} (${g.progress}%)`).join('\n')
  : '- No goals defined'}

**YOUR RESPONSIBILITIES:**
1. Analyze spending patterns and suggest optimizations
2. Help establish and achieve financial goals
3. Identify areas for improvement in cash flow
4. Provide insights on the Apex Score
5. Answer specific questions about personal/business finances

**RULES:**
- Always base your advice on the user's real data
- If the user asks about non-financial topics, gently redirect to finances
- Use emojis occasionally to make the conversation friendly (maximum 2 per message)
- If you detect concerning patterns, be honest but constructive
- Celebrate the user's achievements and progress

Respond conversationally, as an expert financial advisor who knows the user's situation.`;

    // Build conversation history
    const chatHistory = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Start chat with history
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood. I\'m Apex AI, your financial advisor. I\'ve analyzed your financial situation and I\'m ready to help you optimize your finances. How can I assist you today?' }],
        },
        ...chatHistory.slice(0, -1), // Exclude last user message
      ],
    });

    // Get last user message
    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // Generate response with streaming
    const result = await chat.sendMessageStream(lastUserMessage);

    // Create response stream
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
