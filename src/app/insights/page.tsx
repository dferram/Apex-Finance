"use client";

import { ApexInsights as InsightsSidebar } from "@/components/insights/ApexInsights";
import { GeminiChat } from "@/components/insights/GeminiChat";

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Apex Intelligence</h1>
        <p className="text-muted-foreground mt-1">Context-aware financial advisory powered by AI.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Chat Principal - Ocupa 2 columnas en pantallas grandes */}
        <div className="lg:col-span-2">
          <GeminiChat />
        </div>
        
        {/* Insights Tradicionales - Sidebar en pantallas grandes */}
        <div className="lg:col-span-1">
          <InsightsSidebar />
        </div>
      </div>
    </div>
  );
}
