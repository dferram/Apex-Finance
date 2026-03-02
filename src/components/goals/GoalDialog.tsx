"use client";

import { useState } from "react";
import { useApex } from "@/context/ApexContext";
import { createFinancialGoal } from "@/app/actions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export function GoalDialog({ children }: { children?: React.ReactNode }) {
  const { user, activeWorkspace, refreshData } = useApex();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [currency, setCurrency] = useState("MXN");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target || !user) return;
    
    setLoading(true);

    const rawAmount = Number(target);
    const convertedAmount = currency === "USD" ? rawAmount * 17.31 : rawAmount;

    try {
      const result = await createFinancialGoal({
        user_id: user.id,
        name,
        target_amount: convertedAmount,
        deadline: deadline ? new Date(deadline) : undefined,
      });

      if (result.success) {
        setOpen(false);
        setName("");
        setTarget("");
        setDeadline("");
        await refreshData();
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
          <DialogTitle>New Financial Goal</DialogTitle>
          <DialogDescription>
            Create a strategic goal for {activeWorkspace?.is_professional ? "xCore" : "your personal account"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Emergency fund, Runway 12 months, Equipment purchase" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Target Amount</Label>
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
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="MXN" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MXN">MXN (Pesos)</SelectItem>
                  <SelectItem value="USD">USD (Dollars)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {currency === "USD" && target && (
            <div className="text-xs text-muted-foreground bg-workspace/5 p-2 rounded border border-workspace/10 flex justify-between items-center">
              <span>Conversion (1 USD = 17.31 MXN):</span>
              <span className="font-mono font-bold text-workspace">
                ${(Number(target) * 17.31).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (Optional)</Label>
            <Input 
              id="deadline" 
              type="date" 
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-workspace text-white hover:bg-workspace/90">
              {loading ? "Creating..." : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
