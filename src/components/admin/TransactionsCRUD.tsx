"use client";

import { useState, useEffect, useCallback } from "react";
import { useApex } from "@/context/ApexContext";
import { updateTransaction, deleteTransaction, getTransactionsPaginated, type PaginatedResult } from "@/app/actions";
import type { TransactionWithCategory } from "@/lib/schema";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { format } from "date-fns";

const PAGE_SIZE = 15;

export function TransactionsCRUD() {
  const { categories, activeWorkspace, refreshData } = useApex();
  const [editItem, setEditItem] = useState<TransactionWithCategory | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [result, setResult] = useState<PaginatedResult<TransactionWithCategory> | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [isEssential, setIsEssential] = useState(true);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
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

  const openEdit = (tx: TransactionWithCategory) => {
    setEditItem(tx);
    setAmount(String(tx.amount));
    setDescription(tx.description);
    setCategoryId(String(tx.category_id));
    setDate(tx.date ? format(new Date(tx.date), "yyyy-MM-dd") : "");
    setIsEssential(tx.is_essential ?? true);
    setError(null);
  };

  const handleSave = async () => {
    if (!editItem) return;
    setSaving(true);
    setError(null);
    const result = await updateTransaction(editItem.id, {
      amount: Number(amount),
      description,
      category_id: Number(categoryId),
      date: date ? new Date(date) : undefined,
      is_essential: isEssential,
    });
    setSaving(false);
    if (result.success) {
      setEditItem(null);
      await refreshData();
      await fetchPage();
    } else {
      setError(result.error || "Error saving");
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setSaving(true);
    await deleteTransaction(deleteId);
    setSaving(false);
    setDeleteId(null);
    await refreshData();
    await fetchPage();
  };

  const startItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  return (
    <div>
      {/* Search bar */}
      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-auto rounded-lg border border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Essential</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Loading…
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No transactions.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{tx.description}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{tx.category?.name ?? "—"}</TableCell>
                  <TableCell>
                    <span className={tx.amount >= 0 ? "text-emerald-500" : "text-destructive"}>
                      {tx.amount >= 0 ? "+" : ""}
                      {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {tx.date ? format(new Date(tx.date), "dd/MM/yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.is_essential ? "default" : "secondary"}>
                      {tx.is_essential ? "Sí" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(tx)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(tx.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            {startItem}–{endItem} of {total.toLocaleString()}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1 || loading}
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
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Amount</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="essential" checked={isEssential} onCheckedChange={setIsEssential} />
              <Label htmlFor="essential">Essential</Label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this transaction? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
