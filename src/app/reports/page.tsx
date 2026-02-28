"use client";

import { useApex } from "@/context/ApexContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useMemo } from "react";
import { DownloadCloud, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const { transactions, activeWorkspace } = useApex();
  const isProf = activeWorkspace.is_professional;
  const accentColor = isProf ? "#3b82f6" : "#10b981"; // blue-500 : emerald-500

  // Calculate monthly aggregates
  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number; expenses: number; name: string }> = {};
    
    // Process all transactions
    transactions.forEach(tx => {
      const monthKey = `${tx.date.getFullYear()}-${tx.date.getMonth()}`;
      const monthName = tx.date.toLocaleString('default', { month: 'short' });
      
      if (!months[monthKey]) {
         months[monthKey] = { income: 0, expenses: 0, name: monthName };
      }
      
      if (tx.amount > 0) {
        months[monthKey].income += tx.amount;
      } else {
         months[monthKey].expenses += Math.abs(tx.amount);
      }
    });

    // Convert to sorted array
    return Object.values(months).map(m => ({
       name: m.name,
       Income: m.income,
       Expenses: m.expenses
    }));
  }, [transactions]);

  // Insights Data
  const essentialRatio = useMemo(() => {
    const expenses = transactions.filter(t => t.amount < 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
    const essentialExpenses = expenses.filter(t => t.is_essential).reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
    
    if (totalExpenses === 0) return 0;
    return Math.round((essentialExpenses / totalExpenses) * 100);
  }, [transactions]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Intelligence Reports</h1>
          <p className="text-muted-foreground mt-1">Deep dive analytics and historical performance.</p>
        </div>
        <Button variant="outline" className="shrink-0 bg-background/50 border-workspace/30 text-workspace hover:bg-workspace hover:text-white transition-colors">
          <DownloadCloud className="h-4 w-4 mr-2" />
          Export Datasets (CSV)
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="glass-panel md:col-span-3">
          <CardHeader>
             <CardTitle className="text-lg">Income vs. Expenses</CardTitle>
             <CardDescription>Monthly aggregated cash flow comparison</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-[400px] w-full mt-4">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                   <XAxis 
                     dataKey="name" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                   />
                   <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                     tickFormatter={(val) => `$${val > 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                   />
                   <Tooltip 
                     contentStyle={{ 
                       backgroundColor: "hsl(var(--background))", 
                       borderColor: "hsl(var(--border))",
                       borderRadius: "8px"
                     }}
                     itemStyle={{ color: "hsl(var(--foreground))" }}
                     cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                   />
                   <Legend wrapperStyle={{ paddingTop: '20px' }} />
                   <Bar dataKey="Income" fill={accentColor} radius={[4, 4, 0, 0]} maxBarSize={50} />
                   <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </CardContent>
        </Card>

        <div className="md:col-span-1 flex flex-col gap-6">
           <Card className="glass-panel flex-1">
             <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium flex items-center justify-between">
                    Essential Spend Ratio
                    <Sparkles className="h-4 w-4 text-workspace" />
                 </CardTitle>
             </CardHeader>
             <CardContent>
                 <div className="text-4xl font-black tracking-tighter text-workspace">
                   {essentialRatio}%
                 </div>
                 <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                   {isProf 
                     ? "Percentage of total burn rate categorized as core operational infrastructure vs discretionary marketing/R&D."
                     : "Percentage of budget going to basic living expenses. Try to keep this under 50% for optimal saving."}
                 </p>
                 
                 <div className="w-full bg-secondary h-2 mt-6 rounded-full overflow-hidden">
                    <div className="bg-workspace h-full transition-all duration-1000" style={{ width: `${essentialRatio}%` }}></div>
                 </div>
             </CardContent>
           </Card>
           
           <Card className="glass-panel flex-1 bg-workspace text-white border-0 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                 <Sparkles className="h-24 w-24" />
              </div>
              <CardHeader className="pb-2 relative z-10">
                 <CardTitle className="text-sm font-medium text-white/80">Projections Engine</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                 <div className="text-xl font-bold leading-tight">
                   {isProf 
                     ? "Runway extended by 12 days this month." 
                     : "Porsche goal timeline accelerated by 2 weeks."}
                 </div>
                 <Button variant="secondary" size="sm" className="mt-6 w-full font-semibold border-0 text-workspace hover:bg-white/90">
                   Generate Full Report
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
