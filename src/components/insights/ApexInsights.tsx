"use client";

import { useApex } from "@/context/ApexContext";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Info, AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";
import { useMemo } from "react";

export function ApexInsights() {
  const { activeWorkspace, apexScore, transactions, goals, stats } = useApex();

  const insights = useMemo(() => {
    const list = [];
    const isProf = activeWorkspace?.is_professional ?? false;
    
    // 1. Spending velocity (Day by day analysis)
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last7DaysTxs = transactions.filter(t => t.date && new Date(t.date) >= last7Days && t.amount < 0);
    const weekSpend = Math.abs(last7DaysTxs.reduce((acc, curr) => acc + curr.amount, 0));
    
    if (weekSpend > 0) {
      if (isProf) {
        list.push({
          type: "info",
          title: "Operating Burn",
          description: `You've spent $${weekSpend.toLocaleString()} in operations this week. This is ${apexScore > 80 ? "well managed" : "higher than ideal"}.`,
          icon: TrendingUp
        });
      } else {
        list.push({
          type: "info",
          title: "Weekly Velocity",
          description: `You've spent $${weekSpend.toLocaleString()} in the last 7 days. ${weekSpend > 1000 ? "Watch your discretionary limits." : "Good discipline so far!"}`,
          icon: TrendingUp
        });
      }
    }

    // 2. Goal Progress
    if (goals.length > 0) {
      const mainGoal = goals[0]; // Logic could be improved to find closest
      const progress = (stats.totalBalance / mainGoal.target_amount) * 100;
      
      list.push({
        type: progress > 50 ? "success" : "info",
        title: `${mainGoal.name} Progress`,
        description: `You've reached ${Math.min(100, Math.round(progress))}% of your target. ${progress > 90 ? "Almost there!" : "Keep consistent saves."}`,
        icon: CheckCircle2
      });
    } else if (!isProf) {
      list.push({
        type: "warning",
        title: "No Goals Set",
        description: "You haven't defined any financial goals. Setting a target can increase savings by 20%.",
        icon: AlertTriangle
      });
    }

    // 3. Category Spike
    const categoryTotals: Record<string, number> = {};
    transactions.filter(t => t.amount < 0).forEach(t => {
      const catName = t.category?.name || "Other";
      categoryTotals[catName] = (categoryTotals[catName] || 0) + Math.abs(t.amount);
    });

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      list.push({
        type: "info",
        title: "Top Spending Area",
        description: `Your highest spend is in '${topCategory[0]}' ($${topCategory[1].toLocaleString()}). Is this as planned?`,
        icon: Lightbulb
      });
    }

    // Fallback if no data
    if (list.length === 0) {
      list.push({
        type: "info",
        title: "Waiting for Data",
        description: "Add more transactions to unlock personalized financial intelligence.",
        icon: Info
      });
    }

    return list.slice(0, 3); // Max 3 insights
  }, [activeWorkspace, apexScore, transactions, goals, stats]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="h-5 w-5 text-workspace" />
        <h3 className="font-semibold text-lg tracking-tight">Apex Intelligence</h3>
      </div>
      
      {insights.map((insight, idx) => {
        const Icon = insight.icon;
        
        let bgColor = "bg-muted";
        let iconColor = "text-muted-foreground";
        let borderColor = "border-border";

        if (insight.type === "warning") {
          bgColor = "bg-destructive/10";
          iconColor = "text-destructive";
          borderColor = "border-destructive/20";
        } else if (insight.type === "success") {
          bgColor = "bg-emerald-500/10";
          iconColor = "text-emerald-500";
          borderColor = "border-emerald-500/20";
        } else if (insight.type === "info") {
          const isProf = activeWorkspace?.is_professional ?? false;
          bgColor = isProf ? "bg-blue-500/10" : "bg-emerald-500/10";
          iconColor = isProf ? "text-blue-500" : "text-emerald-500";
          borderColor = isProf ? "border-blue-500/20" : "border-emerald-500/20";
        }

        return (
          <Card key={idx} className={`glass-panel border ${borderColor}`}>
            <CardHeader className="p-4 pb-2 flex flex-row items-start space-y-0 gap-3">
              <div className={`p-2 rounded-md ${bgColor} shrink-0`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle className="text-sm font-semibold leading-none mt-1">{insight.title}</CardTitle>
                <p className="text-xs text-muted-foreground leading-snug mt-1.5">{insight.description}</p>
              </div>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
