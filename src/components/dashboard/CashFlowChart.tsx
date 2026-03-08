"use client";

import { useApex } from "@/context/ApexContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";
import { format } from "date-fns";

/** Normalize to local YYYY-MM-DD so date-only strings and timestamps bucket correctly. */
function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function CashFlowChart() {
  const { transactions, activeWorkspace } = useApex();

  const chartData = useMemo(() => {
    const today = new Date();
    const points: { dateLabel: string; dateKey: string; Income: number; Expenses: number; Accumulated: number }[] = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateKey = toLocalDateKey(d);

      const dayTxs = transactions.filter((t) => {
        if (!t.date) return false;
        const tKey = toLocalDateKey(new Date(t.date));
        return tKey === dateKey;
      });

      const income = dayTxs.filter((t) => t.amount > 0).reduce((acc, curr) => acc + curr.amount, 0);
      const expenses = Math.abs(dayTxs.filter((t) => t.amount < 0).reduce((acc, curr) => acc + curr.amount, 0));

      points.push({
        dateLabel: format(d, "MMM dd"),
        dateKey,
        Income: income,
        Expenses: expenses,
        Accumulated: 0,
      });
    }

    let accumulated = 0;
    return points.map((p) => {
      accumulated += p.Income - p.Expenses;
      return { ...p, Accumulated: accumulated };
    });
  }, [transactions]);

  const isProf = activeWorkspace?.is_professional ?? false;
  const accentColor = isProf ? "#3b82f6" : "#10b981";
  const expenseColor = "#ef4444";
  const hasActivity = chartData.some((d) => d.Income > 0 || d.Expenses > 0);

  return (
    <Card className="glass-panel col-span-3 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Cash Flow Pulse</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[300px] w-full flex flex-col items-center justify-center px-6">
          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={expenseColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={expenseColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="dateLabel"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    minTickGap={30}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(val) => `$${val > 1000 ? (val / 1000).toFixed(1) + "k" : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
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
              {!hasActivity && (
                <p className="text-muted-foreground text-xs text-center mt-1">No activity in the last 30 days.</p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-sm text-center">Loading…</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
