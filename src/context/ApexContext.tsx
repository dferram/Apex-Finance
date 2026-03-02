"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useOptimistic, useRef } from "react";
import { getTransactions, getApexStats, getCategories, getCategoriesHierarchical, getCategoryTotalsHierarchical, getFinancialGoals, type CategoryNode } from "@/app/actions";
import { type User, type Workspace, type Category, type TransactionWithCategory, type GoalWithNumbers } from "@/lib/schema";

interface ApexStats {
  totalBalance: number;
  weeklyExpense: number;
  totalIncome: number;
  totalExpense: number;
}

interface ApexContextType {
  user: User;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  categories: Category[];
  categoriesHierarchical: CategoryNode[];
  categoriesHierarchicalTotals: { category_id: number; total_amount: string }[];
  transactions: TransactionWithCategory[];
  goals: GoalWithNumbers[];
  apexScore: number;
  stats: ApexStats;
  isLoading: boolean;
  isInitializing: boolean;
  switchWorkspace: (id: number) => Promise<void>;
  addOptimisticTransaction: (tx: TransactionWithCategory) => void;
  refreshData: () => Promise<void>;
}

const ApexContext = createContext<ApexContextType | undefined>(undefined);

export function ApexProvider({ 
  children,
  initialWorkspaces = [],
}: { 
  children: React.ReactNode;
  initialWorkspaces?: Workspace[];
}) {
  const [user] = useState<User>({ id: 1, name: 'Usuario', email: 'usuario@ejemplo.com', created_at: new Date() });
  const [workspaces] = useState<Workspace[]>(initialWorkspaces);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(initialWorkspaces[0] ?? null);
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesHierarchical, setCategoriesHierarchical] = useState<CategoryNode[]>([]);
  const [categoriesHierarchicalTotals, setCategoriesHierarchicalTotals] = useState<{ category_id: number; total_amount: string }[]>([]);
  const [stats, setStats] = useState<ApexStats>({ totalBalance: 0, weeklyExpense: 0, totalIncome: 0, totalExpense: 0 });
  const [goals, setGoals] = useState<GoalWithNumbers[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const hasLoadedData = useRef(false);

  const [optimisticTransactions, addOptimisticTransaction] = useOptimistic(
    transactions,
    (state, newTx: TransactionWithCategory) => [newTx, ...state]
  );

  const loadWorkspaceData = async (workspaceId: number) => {
    try {
      const [txs, newStats, newCats, newCatsHier, newTotals, newGoals] = await Promise.all([
        getTransactions(workspaceId),
        getApexStats(workspaceId),
        getCategories(workspaceId),
        getCategoriesHierarchical(workspaceId),
        getCategoryTotalsHierarchical(workspaceId),
        getFinancialGoals(user.id),
      ]);
      setTransactions(txs);
      setStats(newStats);
      setCategories(newCats);
      setCategoriesHierarchical(newCatsHier);
      setCategoriesHierarchicalTotals(newTotals);
      setGoals(newGoals);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeWorkspace && !hasLoadedData.current) {
      hasLoadedData.current = true;
      setIsInitializing(true);
      loadWorkspaceData(activeWorkspace.id).finally(() => setIsInitializing(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace]);

  const switchWorkspace = async (id: number) => {
    setIsLoading(true);
    try {
      const workspace = workspaces.find((w) => w.id === id);
      if (workspace) {
        setActiveWorkspace(workspace);
        await loadWorkspaceData(id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    try {
      await loadWorkspaceData(activeWorkspace.id);
    } finally {
      setIsLoading(false);
    }
  };

  const apexScore = useMemo(() => {
    if (!activeWorkspace) return 100;
    
    let score = 100;
    const isProfessional = activeWorkspace.is_professional;
    
    if (!isProfessional) {
      const expenses = optimisticTransactions.filter((t) => t.amount < 0);
      const nonEssentialSpend = Math.abs(expenses.filter((t) => !t.is_essential).reduce((acc, curr) => acc + curr.amount, 0));
      const income = optimisticTransactions.filter((t) => t.amount > 0).reduce((acc, curr) => acc + curr.amount, 0);
      
      const totalBudget = income > 0 ? income : 1;
      const penalty = (nonEssentialSpend / totalBudget) * 100;
      score = Math.max(0, 100 - penalty);
    } else {
      const expenses = optimisticTransactions.filter((t) => t.amount < 0);
      const burnRate = Math.abs(expenses.reduce((acc, curr) => acc + curr.amount, 0));
      const income = optimisticTransactions.filter((t) => t.amount > 0).reduce((acc, curr) => acc + curr.amount, 0);
      
      const totalIncome = income > 0 ? income : 1;
      const penalty = (burnRate / totalIncome) * 100;
      score = Math.max(0, 100 - penalty);
    }

    return Math.round(score);
  }, [optimisticTransactions, activeWorkspace]);

  useEffect(() => {
    if (typeof document !== 'undefined' && activeWorkspace) {
      const isProfessional = activeWorkspace.is_professional;
      document.documentElement.classList.remove('theme-personal', 'theme-professional');
      document.documentElement.classList.add(isProfessional ? 'theme-professional' : 'theme-personal');
    }
  }, [activeWorkspace]);

  const value = {
    user,
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    categories,
    categoriesHierarchical,
    categoriesHierarchicalTotals,
    transactions: optimisticTransactions,
    goals,
    apexScore,
    stats,
    isLoading,
    isInitializing,
    switchWorkspace,
    addOptimisticTransaction,
    refreshData,
  };

  return <ApexContext.Provider value={value}>{children}</ApexContext.Provider>;
}

export function useApex() {
  const context = useContext(ApexContext);
  if (context === undefined) {
    throw new Error("useApex must be used within an ApexProvider");
  }
  return context;
}
