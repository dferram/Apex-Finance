"use client";

import { useApex } from "@/context/ApexContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingDown, TrendingUp, Activity } from "lucide-react";

export function KPICards() {
  const { activeWorkspace, stats, apexScore } = useApex();

  // Use pre-computed stats from the server (getApexStats) instead of
  // recalculating from the full transactions array on the client.
  const metrics = {
    balance: stats.totalBalance,
    weeklySpend: stats.weeklyExpense,
    income: stats.totalIncome,
    expenses: stats.totalExpense,
    isProf: activeWorkspace?.is_professional,
  };

  // Determine color based on score
  let scoreColor = "text-emerald-500";
  if (apexScore < 50) scoreColor = "text-destructive";
  else if (apexScore < 80) scoreColor = "text-yellow-500";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="glass-panel overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-workspace"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {metrics.isProf ? "Net Balance / Runway" : "Available Balance"}
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">
            ${metrics.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
            +${metrics.income.toLocaleString()} total in
          </p>
        </CardContent>
      </Card>

      <Card className="glass-panel overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-destructive"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {metrics.isProf ? "Current Burn Rate" : "Weekly Spend"}
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">
            ${metrics.weeklySpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <TrendingDown className="h-3 w-3 mr-1 text-destructive" />
            -${metrics.expenses.toLocaleString()} total out
          </p>
        </CardContent>
      </Card>

      <Card className="glass-panel overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Apex Score</CardTitle>
          <Activity className={`h-4 w-4 ${scoreColor}`} />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-2">
            <div className={`text-4xl font-black tracking-tighter ${scoreColor}`}>
              {apexScore}
            </div>
            <span className="text-sm text-muted-foreground font-medium">/ 100</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.isProf 
              ? "Financial health & sustainability" 
              : "Financial discipline index"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
