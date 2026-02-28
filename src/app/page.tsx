import { KPICards } from "@/components/dashboard/KPICards";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { CategoryDonut } from "@/components/dashboard/CategoryDonut";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { ApexInsights } from "@/components/insights/ApexInsights";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
           <p className="text-muted-foreground mt-1">Real-time financial telemetry</p>
         </div>
      </div>
      
      <KPICards />
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
           <div className="grid gap-4 md:grid-cols-3">
              <CashFlowChart />
              <CategoryDonut />
           </div>
           <RecentTransactions />
        </div>
        
        <div className="md:col-span-1 border-l border-border pl-4">
           <ApexInsights />
        </div>
      </div>
    </div>
  );
}
