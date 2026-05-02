"use client";

import { useState, useEffect } from "react";
import { useApex } from "@/context/ApexContext";
import { Wallet, Plus, CreditCard, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createWallet, getWalletReport } from "@/app/actions";

export default function WalletsPage() {
  const { activeWorkspace, wallets, refreshData } = useApex();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("MXN");
  const [initialBalance, setInitialBalance] = useState("0");
  const [reports, setReports] = useState<Record<number, Record<string, number>>>({});

  useEffect(() => {
    async function loadReports() {
      const newReports: Record<number, Record<string, number>> = {};
      for (const wallet of wallets) {
        const res = await getWalletReport(wallet.id);
        if (res.success && res.report) {
          newReports[wallet.id] = res.report;
        }
      }
      setReports(newReports);
    }
    if (wallets.length > 0) {
      loadReports();
    }
  }, [wallets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !activeWorkspace) return;

    setLoading(true);
    try {
      const result = await createWallet({
        workspace_id: activeWorkspace.id,
        name,
        currency,
        initial_balance: Number(initialBalance),
      });

      if (result.success) {
        setOpen(false);
        setName("");
        setInitialBalance("0");
        await refreshData();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (!activeWorkspace) return null;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Wallet className="h-8 w-8 text-workspace" />
            Wallets
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your accounts and view specific expense reports.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-workspace hover:bg-workspace/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Wallet</DialogTitle>
              <DialogDescription>
                Add a new wallet, bank account, or card to {activeWorkspace.name}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Wallet Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Cash, Credit Card..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initialBalance">Initial Balance</Label>
                  <Input
                    id="initialBalance"
                    type="number"
                    step="0.01"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
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
              <div className="pt-4 flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-workspace text-white hover:bg-workspace/90">
                  {loading ? "Creating..." : "Create Wallet"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {wallets.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 border-dashed">
          <div className="h-12 w-12 rounded-full bg-workspace/10 flex items-center justify-center mb-4">
            <CreditCard className="h-6 w-6 text-workspace" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Wallets Yet</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-6">
            Create your first wallet to start tracking specific balances and generating reports per account.
          </p>
          <Button onClick={() => setOpen(true)} className="bg-workspace hover:bg-workspace/90 text-white">
            Create First Wallet
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {wallets.map((wallet) => {
            const report = reports[wallet.id] || {};
            const categories = Object.keys(report);
            const totalExpenses = categories.reduce((sum, cat) => sum + report[cat], 0);

            return (
              <Card key={wallet.id} className="overflow-hidden border-workspace/10 shadow-md">
                <div className="h-2 w-full bg-workspace"></div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{wallet.name}</CardTitle>
                      <CardDescription className="uppercase tracking-wider text-xs font-semibold mt-1">
                        {wallet.currency}
                      </CardDescription>
                    </div>
                    <div className="p-2 bg-workspace/10 rounded-full">
                      <DollarSign className="h-5 w-5 text-workspace" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                    <p className="text-3xl font-bold text-foreground">
                      ${Number(wallet.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold mb-3 border-b pb-2">Expense Report (By Category)</h4>
                    {categories.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No expenses recorded from this wallet yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {categories.map(cat => {
                          const amount = report[cat];
                          const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                          return (
                            <div key={cat} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-foreground">{cat}</span>
                                <span className="text-muted-foreground">${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-workspace rounded-full" style={{ width: `${percentage}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                        <div className="pt-2 border-t flex justify-between items-center text-sm font-bold">
                          <span>Total Expenses</span>
                          <span className="text-rose-500">${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
