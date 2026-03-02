"use client";

import { useState } from "react";
import { useApex } from "@/context/ApexContext";
import { updateCategory, deleteCategory } from "@/app/actions";
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
import { type Category } from "@/lib/schema";

export function CategoriesCRUD() {
  const { categories, refreshData } = useApex();
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [isProject, setIsProject] = useState(false);

  const openEdit = (cat: Category) => {
    setEditItem(cat);
    setName(cat.name);
    setParentId(cat.parent_id !== null && cat.parent_id !== undefined ? String(cat.parent_id) : "none");
    setMonthlyBudget(cat.monthly_budget ?? "");
    setIsProject(cat.is_project ?? false);
    setError(null);
  };

  const handleSave = async () => {
    if (!editItem) return;
    setSaving(true);
    setError(null);
    const result = await updateCategory(editItem.id, {
      name,
      parent_id: parentId === "none" ? null : Number(parentId),
      monthly_budget: monthlyBudget !== "" ? Number(monthlyBudget) : null,
      is_project: isProject,
    });
    setSaving(false);
    if (result.success) {
      setEditItem(null);
      await refreshData();
    } else {
      setError(result.error || "Error saving");
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setSaving(true);
    const result = await deleteCategory(deleteId);
    setSaving(false);
    if (result.success) {
      setDeleteId(null);
      await refreshData();
    } else {
      setError(result.error || "Error deleting");
    }
  };

  // Candidates for parent: all categories except editItem itself and its descendants
  const parentCandidates = categories.filter((c) => c.id !== editItem?.id);

  return (
    <div>
      <div className="overflow-auto rounded-lg border border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Monthly Budget</TableHead>
              <TableHead>Project</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No categories.
                </TableCell>
              </TableRow>
            )}
            {categories.map((cat) => {
              const parent = categories.find((c) => c.id === cat.parent_id);
              return (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{parent?.name ?? "—"}</TableCell>
                  <TableCell>{cat.monthly_budget ? `$${Number(cat.monthly_budget).toLocaleString()}` : "—"}</TableCell>
                  <TableCell>
                    <Badge variant={cat.is_project ? "default" : "secondary"}>
                      {cat.is_project ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { setDeleteId(cat.id); setError(null); }}>
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
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Parent Category</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="No parent (root)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent (root)</SelectItem>
                  {parentCandidates.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Monthly Budget</Label>
              <Input type="number" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} placeholder="Optional" />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="is-project" checked={isProject} onCheckedChange={setIsProject} />
              <Label htmlFor="is-project">Is Project</Label>
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
      <Dialog open={deleteId !== null} onOpenChange={(open) => { if (!open) { setDeleteId(null); setError(null); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this category? It will check if it has children or associated transactions.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteId(null); setError(null); }}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
