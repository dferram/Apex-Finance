"use client";

import { ApexInsights as InsightsSidebar } from "@/components/insights/ApexInsights";

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Apex Intelligence</h1>
        <p className="text-muted-foreground mt-1">Context-aware financial advisory.</p>
      </div>
      
      <div className="mt-4">
        <InsightsSidebar />
      </div>
    </div>
  );
}
