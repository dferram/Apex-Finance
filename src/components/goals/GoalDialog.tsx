"use client";

import { useState } from "react";
import { useApex } from "@/context/ApexContext";
import { createFinancialGoal } from "@/app/actions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export function GoalDialog({ children }: { children?: React.ReactNode }) {
  const { user, activeWorkspace } = useApex();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target || !user) return;
    
    setLoading(true);

    try {
      const result = await createFinancialGoal({
        user_id: user.id,
        name,
        target_amount: Number(target),
        deadline: deadline ? new Date(deadline) : undefined,
      });

      if (result.success) {
        setOpen(false);
        setName("");
        setTarget("");
        setDeadline("");
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
          <Button className="bg-workspace hover:bg-workspace/90 text-white shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuevo Objetivo Financiero</DialogTitle>
          <DialogDescription>
            Crea un objetivo estratégico para {activeWorkspace?.is_professional ? "xCore" : "tu cuenta personal"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Objetivo</Label>
            <Input 
              id="name" 
              placeholder="Ej. Fondo de Emergencia, Runway 12 meses, Compra de Equipo" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Meta de Ahorro/Inversión</Label>
            <Input 
              id="target" 
              type="number" 
              placeholder="0.00" 
              step="0.01"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Fecha Límite (Opcional)</Label>
            <Input 
              id="deadline" 
              type="date" 
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-workspace text-white hover:bg-workspace/90">
              {loading ? "Creando..." : "Crear Objetivo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
