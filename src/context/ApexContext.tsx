"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useOptimistic, useTransition } from "react";
import { getTransactions, getApexStats, getCategories } from "@/app/actions";
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
  transactions: TransactionWithCategory[];
  goals: GoalWithNumbers[];
  apexScore: number;
  stats: ApexStats;
  isLoading: boolean;
  switchWorkspace: (id: number) => Promise<void>;
  addOptimisticTransaction: (tx: TransactionWithCategory) => void;
}

const ApexContext = createContext<ApexContextType | undefined>(undefined);

export function ApexProvider({ 
  children,
  initialWorkspaces = [],
  initialActiveWorkspace = null,
  initialTransactions = [],
  initialCategories = [],
  initialStats = { totalBalance: 0, weeklyExpense: 0, totalIncome: 0, totalExpense: 0 },
  initialGoals = []

}: { 
  children: React.ReactNode;
  initialWorkspaces?: Workspace[];
  initialActiveWorkspace?: Workspace | null;
  initialTransactions?: TransactionWithCategory[];
  initialCategories?: Category[];
  initialStats?: ApexStats;
  initialGoals?: GoalWithNumbers[];

}) {
  const [user] = useState<User>({ id: 1, name: 'Usuario', email: 'usuario@ejemplo.com', created_at: new Date() });
  const [workspaces] = useState<Workspace[]>(initialWorkspaces);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(initialActiveWorkspace);
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>(initialTransactions);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [stats, setStats] = useState<ApexStats>(initialStats);
  const [goals] = useState<GoalWithNumbers[]>(initialGoals);      
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransitionSwitch] = useTransition();

  const [optimisticTransactions, addOptimisticTransaction] = useOptimistic(
    transactions,
    (state, newTx: TransactionWithCategory) => [newTx, ...state]
  );

  const switchWorkspace = async (id: number) => {
    setIsLoading(true);
    try {
      const workspace = workspaces.find((w) => w.id === id);
      if (workspace) {
        setActiveWorkspace(workspace);
        
        const [txs, newStats, newCats] = await Promise.all([
          getTransactions(id),
          getApexStats(id),
          getCategories(id)
        ]);
        
        startTransitionSwitch(() => {
          setTransactions(txs);
          setStats(newStats);
          setCategories(newCats);
        });
      }
    } catch (e) {
      console.error(e);
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
    transactions: optimisticTransactions,
    goals,
    apexScore,
    stats,
    isLoading: isLoading || isPending,
    switchWorkspace,
    addOptimisticTransaction,
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
