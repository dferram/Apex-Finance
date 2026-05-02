import { describe, it, expect, vi } from 'vitest';
import { getFinancialGoals, createFinancialGoal, updateGoal, deleteGoal } from '@/app/actions';

describe('Financial Goals Server Actions (Unit Tests)', () => {
  
  describe('getFinancialGoals', () => {
    it('should return all goals for a specific workspace', async () => {
      const result = await getFinancialGoals(1);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('createFinancialGoal', () => {
    it('should create a new goal with a target amount', async () => {
      const data = {
        user_id: 1,
        name: 'Buy a House',
        target_amount: 100000,
        deadline: new Date()
      };
      const result = await createFinancialGoal(data);
      expect(result.success).toBe(true);
      expect(result.goal).toBeDefined();
    });
  });

  describe('updateGoal', () => {
    it('should update progress on a goal', async () => {
      const result = await updateGoal(1, { current_amount: 5000 });
      expect(result.success).toBe(true);
    });
  });

  describe('deleteGoal', () => {
    it('should remove a goal record', async () => {
      const result = await deleteGoal(1);
      expect(result.success).toBe(true);
    });
  });
});
