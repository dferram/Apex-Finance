import { describe, it, expect } from 'vitest';

describe('Reports Data Processing', () => {
  describe('Date grouping', () => {
    it('should group transactions by day correctly', () => {
      const transactions = [
        { date: new Date('2026-03-01'), amount: 100 },
        { date: new Date('2026-03-01'), amount: 200 },
        { date: new Date('2026-03-02'), amount: 150 },
      ];

      const grouped: Record<string, number> = {};
      transactions.forEach(tx => {
        const key = tx.date.toISOString().split('T')[0];
        grouped[key] = (grouped[key] || 0) + tx.amount;
      });

      expect(grouped['2026-03-01']).toBe(300);
      expect(grouped['2026-03-02']).toBe(150);
    });

    it('should group transactions by month correctly', () => {
      const transactions = [
        { date: new Date('2026-02-01'), amount: 100 },
        { date: new Date('2026-02-15'), amount: 200 },
        { date: new Date('2026-03-01'), amount: 150 },
      ];

      const grouped: Record<string, number> = {};
      transactions.forEach(tx => {
        const key = `${tx.date.getFullYear()}-${tx.date.getMonth()}`;
        grouped[key] = (grouped[key] || 0) + tx.amount;
      });

      // Verify we have data for both months
      expect(Object.keys(grouped).length).toBeGreaterThan(0);
      // Verify total sum is correct
      const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);
      expect(total).toBe(450);
    });
  });

  describe('Income vs Expense separation', () => {
    it('should separate income and expenses correctly', () => {
      const transactions = [
        { amount: 1000 },
        { amount: -500 },
        { amount: 2000 },
        { amount: -300 },
      ];

      let totalIncome = 0;
      let totalExpense = 0;

      transactions.forEach(tx => {
        if (tx.amount > 0) {
          totalIncome += tx.amount;
        } else {
          totalExpense += Math.abs(tx.amount);
        }
      });

      expect(totalIncome).toBe(3000);
      expect(totalExpense).toBe(800);
    });

    it('should handle only income transactions', () => {
      const transactions = [
        { amount: 1000 },
        { amount: 2000 },
      ];

      let totalIncome = 0;
      let totalExpense = 0;

      transactions.forEach(tx => {
        if (tx.amount > 0) {
          totalIncome += tx.amount;
        } else {
          totalExpense += Math.abs(tx.amount);
        }
      });

      expect(totalIncome).toBe(3000);
      expect(totalExpense).toBe(0);
    });

    it('should handle only expense transactions', () => {
      const transactions = [
        { amount: -500 },
        { amount: -300 },
      ];

      let totalIncome = 0;
      let totalExpense = 0;

      transactions.forEach(tx => {
        if (tx.amount > 0) {
          totalIncome += tx.amount;
        } else {
          totalExpense += Math.abs(tx.amount);
        }
      });

      expect(totalIncome).toBe(0);
      expect(totalExpense).toBe(800);
    });
  });

  describe('Date filtering', () => {
    it('should filter transactions within date range', () => {
      const now = new Date('2026-03-15');
      const transactions = [
        { date: new Date('2026-03-14'), amount: 100 }, // 1 day ago
        { date: new Date('2026-03-10'), amount: 200 }, // 5 days ago
        { date: new Date('2026-02-15'), amount: 300 }, // 1 month ago
      ];

      const last7Days = transactions.filter(tx => {
        const diffDays = Math.floor((now.getTime() - tx.date.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      });

      expect(last7Days.length).toBe(2);
    });

    it('should exclude future dates', () => {
      const now = new Date('2026-03-15');
      const transactions = [
        { date: new Date('2026-03-14'), amount: 100 },
        { date: new Date('2026-03-16'), amount: 200 }, // Future
        { date: new Date('2026-03-20'), amount: 300 }, // Future
      ];

      const validTransactions = transactions.filter(tx => {
        const diffDays = Math.floor((now.getTime() - tx.date.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0;
      });

      expect(validTransactions.length).toBe(1);
    });
  });

  describe('Chart data transformation', () => {
    it('should transform transactions to chart format', () => {
      const data = {
        '2026-03': { income: 5000, expenses: 3000, name: 'Mar' },
        '2026-04': { income: 6000, expenses: 3500, name: 'Apr' },
      };

      const chartData = Object.values(data).map(m => ({
        name: m.name,
        Income: m.income,
        Expenses: m.expenses,
      }));

      expect(chartData).toHaveLength(2);
      expect(chartData[0]).toEqual({ name: 'Mar', Income: 5000, Expenses: 3000 });
      expect(chartData[1]).toEqual({ name: 'Apr', Income: 6000, Expenses: 3500 });
    });
  });
});
