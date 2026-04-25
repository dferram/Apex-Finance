"use client";

import { useApex } from "@/context/ApexContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useEffect, useState } from "react";
import { getCashFlowPulseData } from "@/app/actions";

export function CashFlowChart() {
  const { activeWorkspace } = useApex();
  const [chartData, setChartData] = useState<
    { dateLabel: string; Income: number; Expenses: number; Accumulated: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeWorkspace?.id) {
      setChartData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getCashFlowPulseData(activeWorkspace.id)
      .then((data) => {
        setChartData(
          data.map((d) => ({
            dateLabel: d.dateLabel,
            Income: d.Income,
            Expenses: d.Expenses,
            Accumulated: d.Accumulated,
          }))
        );
      })
      .catch(() => setChartData([]))
      .finally(() => setLoading(false));
  }, [activeWorkspace?.id]);

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
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 5, bottom: 0 }}>
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
                    width={45}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(val) => `$${val > 1000 ? (val / 1000).toFixed(0) + "k" : val}`}
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
                  <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                    iconType="circle"
                  />
                </AreaChart>
              </ResponsiveContainer>
              {!hasActivity && (
                <p className="text-muted-foreground text-xs text-center mt-1">No activity in this period.</p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-sm">No data.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
