/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Trash2, DollarSign } from "lucide-react";
import { calculateProfitDistribution, type Partner } from "@/lib/companyValuation";

interface ProfitDistributionProps {
  totalProfit: number;
  workspaceId: number;
}

export function ProfitDistribution({ totalProfit, workspaceId }: ProfitDistributionProps) {
  // For now, use local state. In production, this would be fetched from database using workspaceId
  // TODO: Fetch partners from database: getPartners(workspaceId)
  const [partners, setPartners] = useState<Partner[]>([
    { id: 1, name: "Founder 1", percentage: 60 },
    { id: 2, name: "Founder 2", percentage: 40 },
  ]);

  const [open, setOpen] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState("");
  const [newPartnerPercentage, setNewPartnerPercentage] = useState("");

  const distribution = useMemo(() => {
    return calculateProfitDistribution(totalProfit, partners);
  }, [totalProfit, partners]);

  const totalPercentage = partners.reduce((sum, p) => sum + p.percentage, 0);
  const isValidPercentage = Math.abs(totalPercentage - 100) < 0.01;

  const handleAddPartner = () => {
    if (!newPartnerName || !newPartnerPercentage) return;
    
    const percentage = parseFloat(newPartnerPercentage);
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) return;

    const newPartner: Partner = {
      id: Math.max(...partners.map(p => p.id), 0) + 1,
      name: newPartnerName,
      percentage,
    };

    setPartners([...partners, newPartner]);
    setNewPartnerName("");
    setNewPartnerPercentage("");
    setOpen(false);
  };

  const handleRemovePartner = (id: number) => {
    setPartners(partners.filter(p => p.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-workspace" />
              Profit Distribution
            </CardTitle>
            <CardDescription>
              Partner ownership and profit sharing
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="border-workspace/30 text-workspace">
                <Plus className="h-4 w-4 mr-1" />
                Add Partner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Partner</DialogTitle>
                <DialogDescription>
                  Add a new partner and their ownership percentage
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="partner-name">Partner Name</Label>
                  <Input
                    id="partner-name"
                    placeholder="e.g. John Doe"
                    value={newPartnerName}
                    onChange={(e) => setNewPartnerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner-percentage">Ownership %</Label>
                  <Input
                    id="partner-percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="e.g. 25.5"
                    value={newPartnerPercentage}
                    onChange={(e) => setNewPartnerPercentage(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddPartner} className="w-full bg-workspace text-white">
                  Add Partner
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!isValidPercentage && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm">
              Warning: Total ownership is {totalPercentage.toFixed(2)}%, should be 100%
            </div>
          )}

          <div className="space-y-2">
            {distribution.distributions.map((dist) => (
              <div
                key={dist.partnerId}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium">{dist.partnerName}</div>
                  <div className="text-xs text-muted-foreground">
                    {dist.percentage.toFixed(2)}% ownership
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold text-workspace">
                      {formatCurrency(dist.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">profit share</div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive h-8 w-8"
                    onClick={() => handleRemovePartner(dist.partnerId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between p-3 rounded-lg bg-workspace/10 border border-workspace/20">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-workspace" />
                <span className="font-semibold">Total Profit</span>
              </div>
              <span className="text-xl font-bold text-workspace">
                {formatCurrency(distribution.totalProfit)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
