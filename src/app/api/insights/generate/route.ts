import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { insightsRateLimiter, getClientIdentifier } from '@/lib/rateLimiter';

const apiKey = process.env.GOOGLE_AI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientId = getClientIdentifier(request);
    const rateLimitResult = insightsRateLimiter.check(clientId);

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
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const {
      isProfessional,
      totalBalance,
      totalIncome,
      totalExpense,
      transactionCount,
    } = body;

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'Google AI API key not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150,
      },
    });

    const prompt = `Analyze this ${isProfessional ? 'business' : 'personal'} financial data and provide ONE short insight (max 15 words):

Balance: $${totalBalance.toLocaleString()}
Income: $${totalIncome.toLocaleString()}
Expenses: $${totalExpense.toLocaleString()}
Transactions: ${transactionCount}

Rules:
- If transactions = 0: Say "Start tracking to unlock insights"
- If expenses > income: Say "Warning: Expenses exceed income by $X"
- If income > expenses: Say "Saving $X monthly at current rate"
- Use exact numbers
- Maximum 15 words
- No greetings or introductions

Response:`;

    const result = await model.generateContent(prompt);
    const insight = result.response.text().trim();

    return NextResponse.json({ insight });
  } catch (error) {
    console.error('Error generating insight:', error);
    return NextResponse.json(
      { error: 'Failed to generate insight' },
      { status: 500 }
    );
  }
}
