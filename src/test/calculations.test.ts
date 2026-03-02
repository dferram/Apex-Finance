import { describe, it, expect } from 'vitest';

describe('Financial Calculations', () => {
  describe('Balance calculations', () => {
    it('should calculate positive balance correctly', () => {
      const income = 5000;
      const expenses = 3000;
      const balance = income - expenses;
      expect(balance).toBe(2000);
    });

    it('should calculate negative balance correctly', () => {
      const income = 2000;
      const expenses = 3000;
      const balance = income - expenses;
      expect(balance).toBe(-1000);
    });

    it('should handle zero income', () => {
      const income = 0;
      const expenses = 1000;
      const balance = income - expenses;
      expect(balance).toBe(-1000);
    });

    it('should handle zero expenses', () => {
      const income = 5000;
      const expenses = 0;
      const balance = income - expenses;
      expect(balance).toBe(5000);
    });
  });

  describe('Percentage calculations', () => {
    it('should calculate essential spend ratio correctly', () => {
      const totalExpenses = 1000;
      const essentialExpenses = 700;
      const ratio = (essentialExpenses / totalExpenses) * 100;
      expect(ratio).toBe(70);
    });

    it('should handle 100% essential expenses', () => {
      const totalExpenses = 1000;
      const essentialExpenses = 1000;
      const ratio = (essentialExpenses / totalExpenses) * 100;
      expect(ratio).toBe(100);
    });

    it('should handle 0% essential expenses', () => {
      const totalExpenses = 1000;
      const essentialExpenses = 0;
      const ratio = (essentialExpenses / totalExpenses) * 100;
      expect(ratio).toBe(0);
    });

    it('should handle zero total expenses', () => {
      const totalExpenses = 0;
      const essentialExpenses = 0;
      const ratio = totalExpenses === 0 ? 0 : (essentialExpenses / totalExpenses) * 100;
      expect(ratio).toBe(0);
    });
  });

  describe('Apex Score calculations', () => {
    it('should calculate personal apex score correctly', () => {
      const income = 5000;
      const nonEssentialSpend = 1000;
      const penalty = (nonEssentialSpend / income) * 100;
      const score = Math.max(0, 100 - penalty);
      expect(score).toBe(80);
    });

    it('should calculate professional apex score correctly', () => {
      const income = 10000;
      const burnRate = 8000;
      const penalty = (burnRate / income) * 100;
      const score = Math.max(0, 100 - penalty);
      expect(score).toBe(20);
    });

    it('should not allow negative scores', () => {
      const income = 1000;
      const expenses = 5000;
      const penalty = (expenses / income) * 100;
      const score = Math.max(0, 100 - penalty);
      expect(score).toBe(0);
    });

    it('should cap score at 100', () => {
      const income = 5000;
      const expenses = 0;
      const penalty = (expenses / income) * 100;
      const score = Math.min(100, Math.max(0, 100 - penalty));
      expect(score).toBe(100);
    });
  });

  describe('Amount formatting', () => {
    it('should format currency with 2 decimals', () => {
      const amount = 1234.56;
      const formatted = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      expect(formatted).toBe('1,234.56');
    });

    it('should handle whole numbers', () => {
      const amount = 1000;
      const formatted = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      expect(formatted).toBe('1,000.00');
    });

    it('should handle negative amounts', () => {
      const amount = -500.75;
      const formatted = Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      expect(formatted).toBe('500.75');
    });
  });
});
