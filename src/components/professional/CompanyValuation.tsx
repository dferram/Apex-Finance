"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Percent, Building2 } from "lucide-react";
import { calculateSoftwareCompanyValuation, calculateFinancialMetrics, type CompanyMetrics } from "@/lib/companyValuation";

interface CompanyValuationProps {
  transactions: Array<{ amount: number; date: Date; category?: { name?: string } }>;
  companyType?: 'saas' | 'services' | 'consulting' | 'mixed';
}

export function CompanyValuation({ transactions, companyType = 'mixed' }: CompanyValuationProps) {
  const metrics = useMemo<CompanyMetrics>(() => {
    return calculateFinancialMetrics(transactions);
  }, [transactions]);

  const valuation = useMemo(() => {
    return calculateSoftwareCompanyValuation(metrics, companyType);
  }, [metrics, companyType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const confidenceColor = {
    low: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    medium: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    high: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-workspace" />
            Company Valuation
          </CardTitle>
          <CardDescription>
            Estimated value based on {valuation.method}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-workspace">
                  {formatCurrency(valuation.estimatedValuation)}
                </span>
                <Badge className={confidenceColor[valuation.confidence]}>
                  {valuation.confidence} confidence
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {companyType === 'saas' ? 'SaaS' : companyType === 'services' ? 'Services' : companyType === 'consulting' ? 'Consulting' : 'Mixed'} company valuation
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">Revenue Multiple</div>
                <div className="text-lg font-semibold">{valuation.revenueMultiple}x</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">Profit Multiple</div>
                <div className="text-lg font-semibold">{valuation.profitMultiple}x</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-workspace" />
            Financial Metrics
          </CardTitle>
          <CardDescription>
            Key performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Annual Revenue</span>
              </div>
              <span className="font-semibold">{formatCurrency(metrics.annualRevenue)}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Profit Margin</span>
              </div>
              <span className="font-semibold">{metrics.profitMargin.toFixed(1)}%</span>
            </div>

            {metrics.arr > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-emerald-500 font-medium">ARR</span>
                </div>
                <span className="font-semibold text-emerald-500">{formatCurrency(metrics.arr)}</span>
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Monthly Profit</span>
              </div>
              <span className="font-semibold">
                {formatCurrency(metrics.monthlyRevenue - metrics.monthlyExpenses)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
