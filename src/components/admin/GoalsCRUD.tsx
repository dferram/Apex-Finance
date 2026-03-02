"use client";

import { useState } from "react";
import { useApex } from "@/context/ApexContext";
import { updateGoal, deleteGoal } from "@/app/actions";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { type GoalWithNumbers } from "@/lib/schema";

export function GoalsCRUD() {
  const { goals, refreshData } = useApex();
  const [editItem, setEditItem] = useState<GoalWithNumbers | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  const openEdit = (goal: GoalWithNumbers) => {
    setEditItem(goal);
    setName(goal.name);
    setTargetAmount(String(goal.target_amount));
    setCurrentAmount(String(goal.current_amount));
    setDeadline(goal.deadline ? format(new Date(goal.deadline), "yyyy-MM-dd") : "");
    setError(null);
  };

  const handleSave = async () => {
    if (!editItem) return;
    setSaving(true);
    setError(null);
    const result = await updateGoal(editItem.id, {
      name,
      target_amount: Number(targetAmount),
      current_amount: Number(currentAmount),
      deadline: deadline ? new Date(deadline) : null,
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
    const result = await deleteGoal(deleteId);
    setSaving(false);
    if (result.success) {
      setDeleteId(null);
      await refreshData();
    } else {
      setError(result.error || "Error al eliminar");
    }
  };

  return (
    <div>
      <div className="overflow-auto rounded-lg border border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Meta</TableHead>
              <TableHead>Actual</TableHead>
              <TableHead>Progreso</TableHead>
              <TableHead>Fecha límite</TableHead>
              <TableHead className="w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No hay metas financieras.
                </TableCell>
              </TableRow>
            )}
            {goals.map((goal) => {
              const progress = goal.target_amount > 0
                ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
                : 0;
              return (
                <TableRow key={goal.id}>
                  <TableCell className="font-medium">{goal.name}</TableCell>
                  <TableCell>${goal.target_amount.toLocaleString()}</TableCell>
                  <TableCell>${goal.current_amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-workspace transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {goal.deadline ? format(new Date(goal.deadline), "dd/MM/yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(goal)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { setDeleteId(goal.id); setError(null); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Meta Financiera</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Monto Objetivo</Label>
              <Input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Monto Actual</Label>
              <Input type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Fecha Límite</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
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
      <Dialog open={deleteId !== null} onOpenChange={(open) => { if (!open) { setDeleteId(null); setError(null); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">¿Estás seguro de que deseas eliminar esta meta financiera?</p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteId(null); setError(null); }}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? "Eliminando…" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
