"use client";

import { useState } from "react";
import { useApex } from "@/context/ApexContext";
import { updateTransaction, deleteTransaction } from "@/app/actions";
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
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { type TransactionWithCategory } from "@/lib/schema";

export function TransactionsCRUD() {
  const { transactions, categories, refreshData } = useApex();
  const [editItem, setEditItem] = useState<TransactionWithCategory | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [isEssential, setIsEssential] = useState(true);

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
    } else {
      setError(result.error || "Error al guardar");
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setSaving(true);
    await deleteTransaction(deleteId);
    setSaving(false);
    setDeleteId(null);
    await refreshData();
  };

  return (
    <div>
      <div className="overflow-auto rounded-lg border border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripción</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Esencial</TableHead>
              <TableHead className="w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No hay transacciones.
                </TableCell>
              </TableRow>
            )}
            {transactions.map((tx) => (
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Transacción</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Monto</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Descripción</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Categoría</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Fecha</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="essential" checked={isEssential} onCheckedChange={setIsEssential} />
              <Label htmlFor="essential">Es esencial</Label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? "Eliminando…" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
