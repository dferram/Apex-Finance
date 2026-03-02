/**
 * Company Valuation Calculator for Software Development Companies
 * Based on industry-standard metrics for SaaS and software services companies
 */

export interface CompanyMetrics {
  monthlyRevenue: number;
  annualRevenue: number;
  monthlyExpenses: number;
  annualExpenses: number;
  profitMargin: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
}

export interface ValuationResult {
  revenueMultiple: number;
  profitMultiple: number;
  estimatedValuation: number;
  method: string;
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Calculate company valuation for software development companies
 * Uses multiple methods and returns conservative estimate
 */
export function calculateSoftwareCompanyValuation(
  metrics: CompanyMetrics,
  companyType: 'saas' | 'services' | 'consulting' | 'mixed' = 'mixed'
): ValuationResult {
  const { annualRevenue, profitMargin, mrr, arr } = metrics;

  // Industry standard multiples for different types
  const multiples = {
    saas: { revenue: 5, profit: 15 }, // SaaS companies get higher multiples
    services: { revenue: 1.5, profit: 4 }, // Service companies lower multiples
    consulting: { revenue: 1, profit: 3 }, // Consulting lowest
    mixed: { revenue: 2.5, profit: 7 }, // Mixed model
  };

  const selectedMultiples = multiples[companyType];

  // Adjust multiples based on recurring revenue quality
  if (mrr > 0 && mrr / metrics.monthlyRevenue > 0.7) {
    // High recurring revenue gets better multiples
    selectedMultiples.revenue *= 1.2;
  }

  // Calculate using revenue multiple
  const revenueBasedValuation = annualRevenue * selectedMultiples.revenue;

  // Calculate using profit multiple (EBITDA)
  const annualProfit = annualRevenue * (profitMargin / 100);
  const profitBasedValuation = annualProfit * selectedMultiples.profit;

  // For SaaS with recurring revenue, use ARR multiple
  let arrBasedValuation = 0;
  if (arr > 0 && companyType === 'saas') {
    arrBasedValuation = arr * 6; // 6x ARR is common for SaaS
  }

  // Use the most conservative estimate
  const valuations = [revenueBasedValuation, profitBasedValuation, arrBasedValuation].filter(v => v > 0);
  const estimatedValuation = Math.min(...valuations);

  // Determine confidence based on data quality
  let confidence: 'low' | 'medium' | 'high' = 'medium';
  if (arr > 0 && profitMargin > 20) {
    confidence = 'high';
  } else if (annualRevenue < 100000 || profitMargin < 5) {
    confidence = 'low';
  }

  return {
    revenueMultiple: selectedMultiples.revenue,
    profitMultiple: selectedMultiples.profit,
    estimatedValuation,
    method: arrBasedValuation > 0 ? 'ARR Multiple' : 'Revenue/Profit Multiple',
    confidence,
  };
}

/**
 * Calculate profit distribution among partners
 */
export interface Partner {
  id: number;
  name: string;
  percentage: number;
}

export interface ProfitDistribution {
  totalProfit: number;
  distributions: {
    partnerId: number;
    partnerName: string;
    percentage: number;
    amount: number;
  }[];
}

export function calculateProfitDistribution(
  totalProfit: number,
  partners: Partner[]
): ProfitDistribution {
  // Validate percentages sum to 100
  const totalPercentage = partners.reduce((sum, p) => sum + p.percentage, 0);
  
  if (Math.abs(totalPercentage - 100) > 0.01) {
    console.warn(`Partner percentages sum to ${totalPercentage}%, not 100%`);
  }

  const distributions = partners.map(partner => ({
    partnerId: partner.id,
    partnerName: partner.name,
    percentage: partner.percentage,
    amount: (totalProfit * partner.percentage) / 100,
  }));

  return {
    totalProfit,
    distributions,
  };
}

/**
 * Calculate key financial metrics from transactions
 */
export function calculateFinancialMetrics(
  transactions: Array<{ amount: number; date: Date; category?: { name?: string } }>
): CompanyMetrics {
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  // Filter transactions
  const lastMonthTxs = transactions.filter(t => new Date(t.date) >= oneMonthAgo);
  const lastYearTxs = transactions.filter(t => new Date(t.date) >= oneYearAgo);

  // Calculate monthly metrics
  const monthlyRevenue = lastMonthTxs
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlyExpenses = Math.abs(
    lastMonthTxs
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  // Calculate annual metrics
  const annualRevenue = lastYearTxs
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const annualExpenses = Math.abs(
    lastYearTxs
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  // Calculate MRR (Monthly Recurring Revenue) - look for subscription/recurring patterns
  const recurringCategories = ['SaaS Revenue', 'Subscriptions', 'MRR', 'Recurring'];
  const mrr = lastMonthTxs
    .filter(t => 
      t.amount > 0 && 
      recurringCategories.some(cat => t.category?.name?.includes(cat))
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const arr = mrr * 12;

  const profitMargin = annualRevenue > 0 
    ? ((annualRevenue - annualExpenses) / annualRevenue) * 100 
    : 0;

  return {
    monthlyRevenue,
    annualRevenue,
    monthlyExpenses,
    annualExpenses,
    profitMargin,
    mrr,
    arr,
  };
}
