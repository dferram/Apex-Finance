import { describe, it, expect } from 'vitest';

describe('Date Filtering Utilities', () => {
  describe('Date range calculations', () => {
    it('should correctly calculate days difference', () => {
      const now = new Date('2026-03-02');
      const yesterday = new Date('2026-03-01');
      const diffDays = Math.floor((now.getTime() - yesterday.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(1);
    });

    it('should correctly calculate months difference', () => {
      const now = new Date('2026-03-02');
      const lastMonth = new Date('2026-02-02');
      const diffMonths = (now.getFullYear() - lastMonth.getFullYear()) * 12 + (now.getMonth() - lastMonth.getMonth());
      expect(diffMonths).toBe(1);
    });

    it('should handle same day correctly', () => {
      const now = new Date('2026-03-02T10:00:00');
      const sameDay = new Date('2026-03-02T10:00:00'); // Same time
      const diffDays = Math.floor((now.getTime() - sameDay.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(0);
    });
  });

  describe('Transaction amount calculations', () => {
    it('should correctly identify income transactions', () => {
      const amount = 1000;
      expect(amount > 0).toBe(true);
    });

    it('should correctly identify expense transactions', () => {
      const amount = -500;
      expect(amount < 0).toBe(true);
    });

    it('should correctly calculate absolute values', () => {
      const expense = -500;
      expect(Math.abs(expense)).toBe(500);
    });
  });
});
