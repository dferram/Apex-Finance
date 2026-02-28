"use client";

import { useApex } from "@/context/ApexContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useMemo } from "react";

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function CategoryDonut() {
  const { transactions, categories } = useApex();

  const data = useMemo(() => {
    // Get all expenses
    const expenses = transactions.filter(t => t.amount < 0);
    
    // Group by category
    const grouped = expenses.reduce((acc, curr) => {
      const cat = categories.find(c => c.id === curr.category_id);
      const name = cat ? cat.name : "Other";
      if (!acc[name]) acc[name] = 0;
      acc[name] += Math.abs(curr.amount);
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by amount descending
      return Object.entries(grouped)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5 categories
    }, [transactions, categories]);

  if (data.length === 0) {
    return (
      <Card className="glass-panel col-span-3 lg:col-span-1 border-t-4 border-t-workspace">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex flex-col items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground text-sm text-center px-6">No data available for this period.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel col-span-3 lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value?: number) => [`$${(value || 0).toLocaleString()}`, 'Amount']}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))", 
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px"
                }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="bottom"
                align="center"
                 wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
