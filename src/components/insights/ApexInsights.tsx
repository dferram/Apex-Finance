"use client";

import { useApex } from "@/context/ApexContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Info, AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";
import { useMemo } from "react";

export function ApexInsights() {
  const { activeWorkspace, apexScore, transactions, goals } = useApex();

  const insights = useMemo(() => {
    const list = [];
    const isProf = activeWorkspace.is_professional;
    
    // Core Insights based on mode
    if (isProf) {
      if (apexScore < 70) {
        list.push({
          type: "warning",
          title: "High Burn Rate Detected",
          description: "Current burn rate is accelerating. Consider reviewing non-essential marketing spend to extend runway by 1.5 months.",
          icon: AlertTriangle
        });
      } else {
        list.push({
          type: "success",
          title: "Runway Stable",
          description: "Burn rate is well within acceptable margins. Capital efficiency is at peak performance.",
          icon: CheckCircle2
        });
      }

      list.push({
        type: "info",
        title: "AWS Cost Optimization",
        description: "Server costs increased by 15% this month. A reserved instance plan could save up to $450/mo.",
        icon: Info
      });
      
    } else {
      if (apexScore < 70) {
        list.push({
          type: "warning",
          title: "Discretionary Spend Alert",
          description: "Entertainment and luxury expenses are 20% higher than last month. This is impacting your Porsche savings goal.",
          icon: AlertTriangle
        });
      } else {
        list.push({
          type: "success",
          title: "Savings Streak",
          description: "You've stayed under budget for 3 consecutive weeks! The Porsche down payment is 5% closer.",
          icon: TrendingUp
        });
      }

      list.push({
        type: "info",
        title: "Subscription Audit",
        description: "You have 4 active streaming subscriptions. Consolidating could save $25/mo.",
        icon: Lightbulb
      });
    }

    return list;
  }, [activeWorkspace, apexScore, transactions, goals]);

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
          bgColor = activeWorkspace.is_professional ? "bg-blue-500/10" : "bg-emerald-500/10";
          iconColor = activeWorkspace.is_professional ? "text-blue-500" : "text-emerald-500";
          borderColor = activeWorkspace.is_professional ? "border-blue-500/20" : "border-emerald-500/20";
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
