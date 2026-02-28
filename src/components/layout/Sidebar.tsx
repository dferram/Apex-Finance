"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Target, Wallet, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Wallet },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/goals", label: "Financial Goals", icon: Target },
  { href: "/insights", label: "Apex Insights", icon: Lightbulb },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r border-border bg-background pt-6 shrink-0 hidden md:block transition-colors-all">
      <nav className="flex flex-col gap-2 px-4">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-workspace/10 text-workspace"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-6 left-6 right-6">
         <div className="rounded-lg p-4 bg-workspace/5 border border-workspace/10 shadow-sm">
           <h4 className="text-xs font-semibold uppercase text-workspace mb-1 tracking-wider">Apex Status</h4>
           <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
             <span className="text-sm font-medium text-muted-foreground">Systems Nominal</span>
           </div>
         </div>
      </div>
    </div>
  );
}
