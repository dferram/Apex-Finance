"use client";

import { useState } from "react";
import { useApex } from "@/context/ApexContext";
import { createTransaction } from "@/app/actions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EXCHANGE_RATE_USD_MXN, roundCurrency } from "@/lib/utils";
 
export function TransactionDialog({ children }: { children?: React.ReactNode }) {
  const { activeWorkspace, categoriesHierarchical, wallets, addOptimisticTransaction, refreshData } = useApex();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
 
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("MXN");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("expense");
  const [categoryId, setCategoryId] = useState("");
  const [walletId, setWalletId] = useState("none");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !categoryId || !activeWorkspace) return;
 
    setLoading(true);
 
    const rawAmount = Number(amount);
    const convertedAmount = currency === "USD" ? roundCurrency(rawAmount * EXCHANGE_RATE_USD_MXN) : roundCurrency(rawAmount);
    const txAmount = type === "expense" ? -Math.abs(convertedAmount) : Math.abs(convertedAmount);
 
    const txDate = new Date(date + "T12:00:00");

    const newTxData = {
      workspace_id: activeWorkspace.id,
      category_id: Number(categoryId),
      wallet_id: walletId !== "none" ? Number(walletId) : undefined,
      amount: txAmount,
      description,
      date: txDate.toISOString(),
      is_essential: type === "expense",
    };

    addOptimisticTransaction({
      ...newTxData,
      id: Math.random() * -1000,
      date: txDate,
      category: categoriesHierarchical.find((c) => c.id === Number(categoryId)) || null,
    });

    try {
      const result = await createTransaction(newTxData);
      if (result.success) {
        setOpen(false);
        setAmount("");
        setDescription("");
        setCategoryId("");
        setWalletId("none");
        setDate(new Date().toISOString().slice(0, 10));
      } else {
        alert(`Error: ${result.error}`);
      }
      await refreshData();
    } catch (error) {
      console.error(error);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const isProf = activeWorkspace?.is_professional;
  const wsCategories = categoriesHierarchical || [];

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
          <DialogTitle>New Transaction</DialogTitle>
          <DialogDescription>
            Add a transaction to the {isProf ? "xCore" : "Personal"} workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
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

          {currency === "USD" && amount && (
            <div className="text-xs text-muted-foreground bg-workspace/5 p-2 rounded border border-workspace/10 flex justify-between items-center">
              <span>Conversion (1 USD = {EXCHANGE_RATE_USD_MXN} MXN):</span>
              <span className="font-mono font-bold text-workspace">
                ${roundCurrency(Number(amount) * EXCHANGE_RATE_USD_MXN).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g. Grocery shopping"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {wsCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.full_path}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="wallet">Wallet (Optional)</Label>
              <Select value={walletId} onValueChange={setWalletId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Wallet</SelectItem>
                  {wallets?.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id.toString()}>{wallet.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-workspace text-white hover:bg-workspace/90">
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
