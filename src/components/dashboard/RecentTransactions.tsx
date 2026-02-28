"use client";

import { useApex } from "@/context/ApexContext";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

export function RecentTransactions() {
  const { transactions, categories, activeWorkspace } = useApex();

  const recentTxs = useMemo(() => {
    return [...transactions]
      .filter(t => t.date !== null)
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 10); // Show max 10
  }, [transactions]);

  // Color mappings
  const isProf = activeWorkspace?.is_professional ?? false;
  const primaryBadgeColor = isProf ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
  const secondaryBadgeColor = "bg-muted text-muted-foreground hover:bg-muted/80";

  if (recentTxs.length === 0) {
    return (
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Ledger</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex flex-col items-center justify-center min-h-[200px]">
           <p className="text-muted-foreground text-sm text-center px-6">No recent transactions to display.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel overflow-hidden border-t-4 border-t-workspace">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Ledger Terminal</CardTitle>
          <Badge variant="outline" className="text-xs font-mono">LIVE / {isProf ? "xCore" : "Personal"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border">
              <TableHead className="w-[100px] text-xs uppercase font-mono tracking-wider ml-4 pl-6">Date</TableHead>
              <TableHead className="text-xs uppercase font-mono tracking-wider">Description</TableHead>
              <TableHead className="text-xs uppercase font-mono tracking-wider text-right pr-6">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTxs.map((tx) => {
              const cat = categories.find(c => c.id === tx.category_id);
              const isIncome = tx.amount > 0;
              const formattedDate = tx.date ? format(new Date(tx.date), "MMM dd") : "N/A";
              
              const amountClass = isIncome 
                ? (isProf ? "text-blue-500" : "text-emerald-500") 
                : "text-foreground";

              return (
                <TableRow key={tx.id} className="border-border/50 hover:bg-muted/30 group transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground pl-6">
                    {formattedDate}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm text-foreground/90 group-hover:text-foreground transition-colors">{tx.description}</span>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 rounded-sm font-medium ${tx.is_essential ? primaryBadgeColor : secondaryBadgeColor}`}>
                          {cat?.name || "Uncategorized"}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={`text-right font-mono text-sm tracking-tight pr-6 ${amountClass}`}>
                    {isIncome ? "+" : "-"}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
