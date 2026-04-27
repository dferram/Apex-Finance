"use client";

import { useApex } from "@/context/ApexContext";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { getTransactionsPaginated, type PaginatedResult } from "@/app/actions";
import type { TransactionWithCategory } from "@/lib/schema";
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
import { Plus, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { CategoryDialog } from "@/components/transactions/CategoryDialog";

const PAGE_SIZE = 25;

export default function TransactionsPage() {
  const { categories, activeWorkspace } = useApex();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResult<TransactionWithCategory> | null>(null);
  const [loading, setLoading] = useState(true);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchPage = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    setLoading(true);
    try {
      const data = await getTransactionsPaginated(
        activeWorkspace.id,
        page,
        PAGE_SIZE,
        debouncedSearch || undefined
      );
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace?.id, page, debouncedSearch]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const transactions = result?.data ?? [];
  const totalPages = result?.totalPages ?? 0;
  const total = result?.total ?? 0;

  const isProf = activeWorkspace?.is_professional;
  const primaryBadgeColor = isProf ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500";
  const secondaryBadgeColor = "bg-muted text-muted-foreground";

  const startItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

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
          <div className="flex items-center gap-2">
            <CategoryDialog />
          </div>
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No transactions found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => {
                const cat = categories.find(c => c.id === tx.category_id);
                const isIncome = tx.amount > 0;
                
                const amountClass = isIncome 
                  ? (isProf ? "text-blue-500" : "text-emerald-500") 
                  : "text-foreground";

                return (
                  <TableRow key={tx.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-sm text-muted-foreground pl-6">
                      {tx.date ? format(new Date(tx.date), "MMM dd, yyyy") : "—"}
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

        {/* Pagination Controls */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/10">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{startItem}–{endItem}</span> of{" "}
              <span className="font-medium text-foreground">{total.toLocaleString()}</span> transactions
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(1)}
                disabled={page === 1 || loading}
                aria-label="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1 || loading}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-mono px-3 text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages || loading}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages || loading}
                aria-label="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
