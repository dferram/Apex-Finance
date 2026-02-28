"use client";

import { useApex } from "@/context/ApexContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";
import { format } from "date-fns";

export function CashFlowChart() {
  const { transactions, activeWorkspace } = useApex();

  const data = useMemo(() => {
    // Generate last 30 days data points
    const points = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      
      // Get transactions for this day
      const dayTxs = transactions.filter(
        t => t.date.getDate() === d.getDate() && 
             t.date.getMonth() === d.getMonth() && 
             t.date.getFullYear() === d.getFullYear()
      );
      
      const income = dayTxs.filter(t => t.amount > 0).reduce((acc, curr) => acc + curr.amount, 0);
      const expenses = Math.abs(dayTxs.filter(t => t.amount < 0).reduce((acc, curr) => acc + curr.amount, 0));
      
      points.push({
        date: format(d, 'MMM dd'),
        Income: income,
        Expenses: expenses,
        Balance: income - expenses
      });
    }
    
    // Accumulate balance
    let currentBalance = 0;
    return points.map(p => {
      currentBalance += p.Balance;
      return { ...p, Accumulated: currentBalance };
    });
  }, [transactions]);

  // Use the workspace accent color
  const isProf = activeWorkspace.is_professional;
  const accentColor = isProf ? "#3b82f6" : "#10b981"; // blue-500 : emerald-500
  const expenseColor = "#ef4444"; // red-500

  return (
    <Card className="glass-panel col-span-3 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Cash Flow Pulse</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={expenseColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={expenseColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(val) => `$${val > 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))", 
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area 
                type="monotone" 
                dataKey="Income" 
                stroke={accentColor} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorIncome)" 
              />
               <Area 
                type="monotone" 
                dataKey="Expenses" 
                stroke={expenseColor} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorExpense)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
