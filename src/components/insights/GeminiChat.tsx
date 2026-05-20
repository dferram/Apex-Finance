"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useApex } from "@/context/ApexContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Loader2 } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function GeminiChat() {
  const { transactions, goals, stats, activeWorkspace, apexScore } = useApex();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Preparar contexto financiero resumido
  const financialContext = useMemo(() => {
    // Calcular totales por categoría (solo top 10 para no agotar tokens)
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter(t => t.amount < 0)
      .forEach(t => {
        const catName = t.category?.name || 'Otros';
        categoryTotals[catName] = (categoryTotals[catName] || 0) + Math.abs(t.amount);
      });

    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([category, amount]) => ({ category, amount }));

    // Calcular gasto semanal
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyTxs = transactions.filter(t => t.date && new Date(t.date) >= last7Days && t.amount < 0);
    const weeklyExpense = Math.abs(weeklyTxs.reduce((acc, curr) => acc + curr.amount, 0));

    // Preparar metas
    const goalsData = goals.map(g => ({
      name: g.name,
      target: g.target_amount,
      current: g.current_amount,
      progress: Math.round((g.current_amount / g.target_amount) * 100),
    }));

    return {
      totalBalance: stats.totalBalance,
      totalIncome: stats.totalIncome,
      totalExpense: stats.totalExpense,
      weeklyExpense,
      categoryTotals: topCategories,
      goals: goalsData,
      apexScore,
      isProfessional: activeWorkspace?.is_professional ?? false,
      workspaceName: activeWorkspace?.name ?? 'Mi Workspace',
    };
  }, [transactions, goals, stats, apexScore, activeWorkspace]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/insights/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: financialContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      // Crear mensaje del asistente vacío
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);
                assistantMessage += parsed.text;
                
                // Actualizar el último mensaje (el del asistente)
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: assistantMessage,
                  };
                  return newMessages;
                });
              } catch (e) {
                console.error('Error parsing chunk:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="glass-panel border border-border/50 flex flex-col h-[600px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <Sparkles className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Apex AI</h3>
            <p className="text-xs text-muted-foreground">Asesor Financiero</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border/30">
          <Sparkles className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">Powered by Gemini</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10">
              <Sparkles className="h-8 w-8 text-purple-500" />
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-1">¡Hola! Soy Apex AI 👋</h4>
              <p className="text-sm text-muted-foreground max-w-md">
                Tu asesor financiero personal. Puedo ayudarte a analizar tus gastos, 
                optimizar tu presupuesto y alcanzar tus metas financieras.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setInput('¿Cómo puedo mejorar mi Apex Score?');
                  inputRef.current?.focus();
                }}
              >
                ¿Cómo mejorar mi score?
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setInput('Analiza mis gastos del último mes');
                  inputRef.current?.focus();
                }}
              >
                Analizar gastos
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setInput('Dame consejos para ahorrar más');
                  inputRef.current?.focus();
                }}
              >
                Consejos de ahorro
              </Button>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-workspace/20 border border-workspace/30 text-foreground'
                    : 'bg-muted/50 border border-border/30 text-foreground'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                    <span className="text-xs font-medium text-muted-foreground">Apex AI</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="max-w-[80%] rounded-2xl px-4 py-2.5 bg-muted/50 border border-border/30">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                <span className="text-sm text-muted-foreground">Analizando...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregúntame sobre tus finanzas..."
            className="flex-1 resize-none rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-workspace/50 focus:border-transparent min-h-[44px] max-h-[120px]"
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[44px] w-[44px] rounded-xl bg-workspace hover:bg-workspace/90 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Apex AI puede cometer errores. Verifica información importante.
        </p>
      </div>
    </Card>
  );
}
