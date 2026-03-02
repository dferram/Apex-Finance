"use client";

import { useState } from "react";
import { useApex } from "@/context/ApexContext";
import { updateWorkspace } from "@/app/actions";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { type Workspace } from "@/lib/schema";

export function WorkspacesCRUD() {
  const { workspaces, activeWorkspace, refreshData } = useApex();
  const [editItem, setEditItem] = useState<Workspace | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("");

  const openEdit = (ws: Workspace) => {
    setEditItem(ws);
    setName(ws.name);
    setCurrency(ws.currency ?? "");
    setError(null);
  };

  const handleSave = async () => {
    if (!editItem) return;
    setSaving(true);
    setError(null);
    const result = await updateWorkspace(editItem.id, { name, currency: currency || undefined });
    setSaving(false);
    if (result.success) {
      setEditItem(null);
      await refreshData();
    } else {
      setError(result.error || "Error saving");
    }
  };

  return (
    <div>
      <div className="overflow-auto rounded-lg border border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workspaces.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No workspaces.
                </TableCell>
              </TableRow>
            )}
            {workspaces.map((ws) => {
              const isActive = ws.id === activeWorkspace?.id;
              return (
                <TableRow key={ws.id}>
                  <TableCell className="font-medium">{ws.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{ws.currency ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={ws.is_professional ? "default" : "secondary"}>
                      {ws.is_professional ? "Professional" : "Personal"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isActive && (
                      <Badge className="bg-workspace/20 text-workspace border-workspace/30">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(ws)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
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
            <DialogTitle>Edit Workspace</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Currency (e.g. USD, EUR, MXN)</Label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USD" />
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
    </div>
  );
}
