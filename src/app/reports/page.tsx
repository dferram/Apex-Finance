"use client";

import { useApex } from "@/context/ApexContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useMemo, useState } from "react";
import { FileText, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TreeView } from "@/components/ui/TreeView";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CategoryNode } from "@/app/actions";

interface TreeItem extends CategoryNode {
  amount: number;
  budget: number;
  children: TreeItem[];
}

interface ChartDataItem {
  name: string;
  Income: number;
  Expenses: number;
}

export default function ReportsPage() {
  const { transactions, activeWorkspace, categoriesHierarchical, categoriesHierarchicalTotals } = useApex();
  
  const [filterRange, setFilterRange] = useState<'day' | 'week' | 'month' | 'budget'>('month');

  // Calculate aggregated data based on filter
  const chartData = useMemo<ChartDataItem[]>(() => {
    if (!activeWorkspace) return [];
    const data: Record<string, { income: number; expenses: number; name: string; timestamp: number }> = {};
    const now = new Date();
    
    transactions.forEach(tx => {
      let key = "";
      let name = "";
      const txDate = tx.date ? new Date(tx.date) : null;
      if (!txDate) return;

      if (filterRange === 'day') {
        const diffDays = Math.floor((now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 14) return;
        key = txDate.toISOString().split('T')[0];
        name = txDate.toLocaleDateString('default', { day: '2-digit', month: 'short' });
      } else if (filterRange === 'week') {
        const diffWeeks = Math.floor((now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        if (diffWeeks > 8) return;
        const weekStart = new Date(txDate);
        weekStart.setDate(txDate.getDate() - txDate.getDay());
        key = weekStart.toISOString().split('T')[0];
        name = `W${Math.ceil(txDate.getDate() / 7)} ${txDate.toLocaleString('default', { month: 'short' })}`;
      } else {
        key = `${txDate.getFullYear()}-${txDate.getMonth()}`;
        name = txDate.toLocaleString('default', { month: 'short' });
      }
      
      if (!data[key]) {
        data[key] = { income: 0, expenses: 0, name, timestamp: txDate.getTime() };
      }
      
      if (tx.amount > 0) {
        data[key].income += tx.amount;
      } else {
        data[key].expenses += Math.abs(tx.amount);
      }
    });

    return Object.values(data)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(m => ({
        name: m.name,
        Income: m.income,
        Expenses: m.expenses
      }));
  }, [transactions, filterRange, activeWorkspace]);

  // Insights Data
  const essentialRatio = useMemo(() => {
    const expenses = transactions.filter(t => t.amount < 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
    const essentialExpenses = expenses.filter(t => t.is_essential).reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
    
    if (totalExpenses === 0) return 0;
    return Math.round((essentialExpenses / totalExpenses) * 100);
  }, [transactions]);

  const treeData = useMemo(() => {
    const map: Record<number, TreeItem> = {};
    const roots: TreeItem[] = [];
    
    categoriesHierarchical.forEach(c => {
      map[c.id] = { 
        ...c, 
        amount: Number(categoriesHierarchicalTotals.find(t => t.category_id === c.id)?.total_amount || 0),
        budget: Number(c.monthly_budget || 0),
        children: [] 
      };
    });
    
    categoriesHierarchical.forEach(c => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].children.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });
    
    return roots;
  }, [categoriesHierarchical, categoriesHierarchicalTotals]);

  // PDF Export Function
  const exportToPDF = () => {
    if (!activeWorkspace) return;
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("Apex Finance - Intelligence Report", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Workspace: ${activeWorkspace.name} (${activeWorkspace.is_professional ? "xCore" : "Personal"})`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 35);
    doc.text(`View: ${filterRange.toUpperCase()}`, 14, 40);

    // Prepare table data
    const tableData = chartData.map(d => [
      d.name,
      `$${d.Income.toLocaleString()}`,
      `$${d.Expenses.toLocaleString()}`,
      `$${(d.Income - d.Expenses).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Period', 'Income', 'Expenses', 'Net']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: activeWorkspace.is_professional ? [59, 130, 246] : [16, 185, 129] },
    });

    doc.save(`Apex_Finance_Report_${filterRange}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Please select a workspace to view reports.</p>
      </div>
    );
  }

  const isProf = activeWorkspace.is_professional;
  const accentColor = isProf ? "#3b82f6" : "#10b981"; // blue-500 : emerald-500

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Financial Intelligence Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm">Deep dive analytics and historical performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={filterRange} onValueChange={(v) => setFilterRange(v as 'day' | 'week' | 'month')} className="bg-background/20 p-1 rounded-lg border border-border h-10 flex">
            <TabsList className="bg-transparent border-0 grid grid-cols-3 w-[260px] h-full gap-1">
              <TabsTrigger value="day" className="text-[11px] h-full data-[state=active]:bg-workspace data-[state=active]:text-white">Daily</TabsTrigger>
              <TabsTrigger value="week" className="text-[11px] h-full data-[state=active]:bg-workspace data-[state=active]:text-white">Weekly</TabsTrigger>
              <TabsTrigger value="month" className="text-[11px] h-full data-[state=active]:bg-workspace data-[state=active]:text-white">Monthly</TabsTrigger>
              <TabsTrigger value="budget" className="text-[11px] h-full data-[state=active]:bg-workspace data-[state=active]:text-white flex items-center gap-1">
                <Target className="h-3 w-3" />
                Budgets
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            variant="outline" 
            onClick={exportToPDF}
            className="h-10 shrink-0 bg-background/50 border-workspace/30 text-workspace hover:bg-workspace hover:text-white transition-all duration-300 font-medium px-4"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export (PDF)
          </Button>
        </div>
      </div>

      <Tabs value={filterRange} onValueChange={(v) => {
        setFilterRange(v as 'day' | 'week' | 'month' | 'budget');
      }} className="w-full">
        <TabsContent value="budget" className="mt-0">
           <Card className="glass-panel">
             <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Target className="h-5 w-5 text-workspace" />
                  Estructura de Presupuesto y Proyectos
                </CardTitle>
                <CardDescription>
                  Visualización jerárquica de gastos. Los gastos se suman automáticamente hacia arriba en la estructura.
                </CardDescription>
             </CardHeader>
             <CardContent className="pt-2">
                <div className="bg-muted/10 rounded-xl p-6 border border-border/50">
                  {treeData.length > 0 ? (
                    <TreeView data={treeData} expandedIds={treeData.map(r => r.id)} />
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-muted-foreground">No hay categorías configuradas para este workspace.</p>
                      <p className="text-xs text-muted-foreground/50 mt-1">Crea categorías y sub-categorías para ver la jerarquía.</p>
                    </div>
                  )}
                </div>
             </CardContent>
           </Card>
        </TabsContent>
        
        <div className={cn("grid gap-6 md:grid-cols-4 transition-all duration-300", filterRange === 'budget' && "opacity-0 invisible h-0 overflow-hidden")}>
        <Card className="glass-panel md:col-span-3">
          <CardHeader>
             <CardTitle className="text-lg">Financial Performance</CardTitle>
             <CardDescription>Aggregated cash flow analysis - Zoom: {filterRange.toUpperCase()}</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-[400px] w-full mt-4">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
      </Tabs>
    </div>
  );
}
