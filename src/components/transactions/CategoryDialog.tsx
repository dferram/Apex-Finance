"use client";

import { useState } from "react";
import { useApex } from "@/context/ApexContext";
import { createCategory } from "@/app/actions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export function CategoryDialog({ children }: { children?: React.ReactNode }) {
  const { activeWorkspace } = useApex();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !activeWorkspace) return;
    
    setLoading(true);

    try {
      const result = await createCategory({
        workspace_id: activeWorkspace.id,
        name,
        monthly_budget: budget ? Number(budget) : undefined,
      });

      if (result.success) {
        setOpen(false);
        setName("");
        setBudget("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="bg-background/50 shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nueva Categoría</DialogTitle>
          <DialogDescription>
            Crea una nueva categoría para organizar tus transacciones en {activeWorkspace?.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Categoría</Label>
            <Input 
              id="name" 
              placeholder="Ej. Software, Comida, Viajes" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Presupuesto Mensual (Opcional)</Label>
            <Input 
              id="budget" 
              type="number" 
              placeholder="0.00" 
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-workspace text-white hover:bg-workspace/90">
              {loading ? "Creando..." : "Crear Categoría"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
