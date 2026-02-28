"use client";

import { useApex } from "@/context/ApexContext";
import { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter } from "lucide-react";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";

export default function TransactionsPage() {
  const { transactions, categories, activeWorkspace } = useApex();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.date.getTime() - a.date.getTime());

  const isProf = activeWorkspace.is_professional;
  const primaryBadgeColor = isProf ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500";
  const secondaryBadgeColor = "bg-muted text-muted-foreground";

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ledger Journal</h1>
          <p className="text-muted-foreground mt-1">
            Complete transaction history for {isProf ? "xCore Engineering" : "Personal Track"}
          </p>
        </div>
        <TransactionDialog>
          <Button className="bg-workspace hover:bg-workspace/90 text-white shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </TransactionDialog>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden border border-border">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between bg-muted/20">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search descriptions..." 
              className="pl-9 bg-background/50 border-border/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="shrink-0 bg-background/50">
            <Filter className="h-4 w-4 mr-2" />
            Filter by Category
          </Button>
        </div>

        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border">
              <TableHead className="w-[120px] text-xs uppercase font-mono tracking-wider ml-4 pl-6">Date</TableHead>
              <TableHead className="text-xs uppercase font-mono tracking-wider">Description</TableHead>
              <TableHead className="text-xs uppercase font-mono tracking-wider">Category</TableHead>
              <TableHead className="text-xs uppercase font-mono tracking-wider text-right pr-6">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No transactions found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => {
                const cat = categories.find(c => c.id === tx.category_id);
                const isIncome = tx.amount > 0;
                
                const amountClass = isIncome 
                  ? (isProf ? "text-blue-500" : "text-emerald-500") 
                  : "text-foreground";

                return (
                  <TableRow key={tx.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-sm text-muted-foreground pl-6">
                      {format(tx.date, "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="font-medium text-foreground/90">
                      {tx.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs px-2 py-0.5 rounded-sm font-medium ${tx.is_essential ? primaryBadgeColor : secondaryBadgeColor}`}>
                        {cat?.name || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-mono text-base tracking-tight pr-6 ${amountClass}`}>
                      {isIncome ? "+" : "-"}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
