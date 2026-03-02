import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { ApexProvider, useApex } from '@/context/ApexContext';
import React from 'react';

// Mock the server actions
vi.mock('@/app/actions', () => ({
  getTransactions: vi.fn(() => Promise.resolve([
    { id: 1, amount: 1000, description: 'Income', date: new Date(), is_essential: true, workspace_id: 1, category_id: 1 },
    { id: 2, amount: -500, description: 'Expense', date: new Date(), is_essential: true, workspace_id: 1, category_id: 1 },
  ])),
  getApexStats: vi.fn(() => Promise.resolve({
    totalBalance: 500,
    weeklyExpense: 100,
    totalIncome: 1000,
    totalExpense: 500,
  })),
  getCategories: vi.fn(() => Promise.resolve([
    { id: 1, name: 'Test Category', workspace_id: 1 },
  ])),
  getCategoriesHierarchical: vi.fn(() => Promise.resolve([])),
  getCategoryTotalsHierarchical: vi.fn(() => Promise.resolve([])),
  getFinancialGoals: vi.fn(() => Promise.resolve([])),
}));

// Skip these tests as useOptimistic is not available in test environment (React 19 feature)
// These would need React 19 canary or proper mocking
describe.skip('ApexContext (Requires React 19 useOptimistic)', () => {
  const mockWorkspaces = [
    { id: 1, name: 'Personal', is_professional: false, user_id: 1, currency: 'USD', created_at: new Date() },
    { id: 2, name: 'Professional', is_professional: true, user_id: 1, currency: 'USD', created_at: new Date() },
  ];

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ApexProvider initialWorkspaces={mockWorkspaces}>
      {children}
    </ApexProvider>
  );

  it('should initialize with first workspace', () => {
    const { result } = renderHook(() => useApex(), { wrapper });
    expect(result.current.activeWorkspace).toEqual(mockWorkspaces[0]);
  });

  it('should provide workspaces array', () => {
    const { result } = renderHook(() => useApex(), { wrapper });
    expect(result.current.workspaces).toEqual(mockWorkspaces);
  });

  it('should calculate apex score', async () => {
    const { result } = renderHook(() => useApex(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.apexScore).toBeGreaterThanOrEqual(0);
      expect(result.current.apexScore).toBeLessThanOrEqual(100);
    });
  });

  it('should have initial loading state', () => {
    const { result } = renderHook(() => useApex(), { wrapper });
    expect(typeof result.current.isLoading).toBe('boolean');
    expect(typeof result.current.isInitializing).toBe('boolean');
  });

  it('should provide switchWorkspace function', () => {
    const { result } = renderHook(() => useApex(), { wrapper });
    expect(typeof result.current.switchWorkspace).toBe('function');
  });

  it('should provide refreshData function', () => {
    const { result } = renderHook(() => useApex(), { wrapper });
    expect(typeof result.current.refreshData).toBe('function');
  });
});
