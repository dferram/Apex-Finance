"use client";

import { useApex } from "@/context/ApexContext";
import { format, addDays, subDays } from "date-fns";
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
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getTransactionsByDateRange } from "@/app/actions";
import type { TransactionWithCategory } from "@/lib/schema";

export function RecentTransactions() {
  const { categories, activeWorkspace } = useApex();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [dayTransactions, setDayTransactions] = useState<TransactionWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeWorkspace?.id) {
      setDayTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    getTransactionsByDateRange(activeWorkspace.id, dateStr)
      .then(setDayTransactions)
      .finally(() => setLoading(false));
  }, [activeWorkspace?.id, selectedDate]);

  const isProf = activeWorkspace?.is_professional ?? false;
  const primaryBadgeColor = isProf ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
  const secondaryBadgeColor = "bg-muted text-muted-foreground hover:bg-muted/80";

  const goPrevDay = () => setSelectedDate((d) => subDays(d, 1));
  const goNextDay = () => setSelectedDate((d) => addDays(d, 1));
  const today = new Date();
  const isToday =
    selectedDate.getDate() === today.getDate() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getFullYear() === today.getFullYear();
  const isFuture = selectedDate > today;

  return (
    <Card className="glass-panel overflow-hidden border-t-4 border-t-workspace">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Ledger</CardTitle>
            <Badge variant="outline" className="text-xs font-mono">
              {isProf ? "xCore" : "Personal"}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={goPrevDay}
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-mono text-sm text-foreground min-w-[140px] text-center">
              {format(selectedDate, "EEE, MMM d, yyyy")}
              {isToday && (
                <span className="ml-1 text-muted-foreground text-xs">(today)</span>
              )}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={goNextDay}
              disabled={isFuture}
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] py-8">
            <p className="text-muted-foreground text-sm">Loading…</p>
          </div>
        ) : dayTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] py-8">
            <p className="text-muted-foreground text-sm text-center px-6">
              No transactions for this day.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-border">
                <TableHead className="w-[80px] text-xs uppercase font-mono tracking-wider pl-6">
                  Time
                </TableHead>
                <TableHead className="text-xs uppercase font-mono tracking-wider">
                  Description
                </TableHead>
                <TableHead className="text-xs uppercase font-mono tracking-wider text-right pr-6">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dayTransactions.map((tx) => {
                const isIncome = tx.amount > 0;
                const dateForTime = tx.date ?? tx.created_at;
                const timeStr = dateForTime
                  ? format(new Date(dateForTime), "HH:mm")
                  : "—";
                const amountClass = isIncome
                  ? isProf
                    ? "text-blue-500"
                    : "text-emerald-500"
                  : "text-foreground";

                return (
                  <TableRow
                    key={tx.id}
                    className="border-border/50 hover:bg-muted/30 group transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground pl-6">
                      {timeStr}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm text-foreground/90 group-hover:text-foreground transition-colors">
                          {tx.description}
                        </span>
                        <div className="flex gap-2">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] px-1.5 py-0 rounded-sm font-medium ${
                              tx.is_essential ? primaryBadgeColor : secondaryBadgeColor
                            }`}
                          >
                            {tx.category?.name ?? "Uncategorized"}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono text-sm tracking-tight pr-6 ${amountClass}`}
                    >
                      {isIncome ? "+" : "-"}$
                      {Math.abs(tx.amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
