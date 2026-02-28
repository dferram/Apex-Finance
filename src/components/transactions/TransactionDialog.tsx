"use client";

import { useState } from "react";
import { useApex } from "@/context/ApexContext";
import { createTransaction } from "@/app/actions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export function TransactionDialog({ children }: { children?: React.ReactNode }) {
  const { activeWorkspace, categories, addOptimisticTransaction } = useApex();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("expense");
  const [categoryId, setCategoryId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !categoryId || !activeWorkspace) return;
    
    setLoading(true);

    const txAmount = type === 'expense' ? -Math.abs(Number(amount)) : Math.abs(Number(amount));

    const newTxData = {
      workspace_id: activeWorkspace.id,
      category_id: Number(categoryId),
      amount: txAmount,
      description,
      date: new Date(),
      is_essential: type === 'expense'
    };

    addOptimisticTransaction({
      ...newTxData,
      id: Math.random() * -1000, 
      date: new Date()
    });

    setOpen(false);

    try {
      await createTransaction(newTxData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setAmount("");
      setDescription("");
      setCategoryId("");
    }
  };

  const isProf = activeWorkspace?.is_professional;
  const wsCategories = categories || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-workspace hover:bg-workspace/90 text-white shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nueva Transacción</DialogTitle>
          <DialogDescription>
            Agrega una transacción al entorno {isProf ? "xCore" : "Personal"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Egreso (Gasto)</SelectItem>
                <SelectItem value="income">Ingreso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input 
              id="amount" 
              type="number" 
              placeholder="0.00" 
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input 
              id="description" 
              placeholder="Ej. Compra de supermercado" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {wsCategories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-workspace text-white hover:bg-workspace/90">
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
