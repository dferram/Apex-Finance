"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useOptimistic, useTransition, startTransition } from "react";
import { getTransactions, getApexStats, getCategories } from "@/app/actions";

interface ApexContextType {
  user: any;
  workspaces: any[];
  activeWorkspace: any;
  setActiveWorkspace: (workspace: any) => void;
  categories: any[];
  transactions: any[];
  goals: any[];
  apexScore: number;
  stats: any;
  isLoading: boolean;
  switchWorkspace: (id: number) => Promise<void>;
  addOptimisticTransaction: (tx: any) => void;
}

const ApexContext = createContext<ApexContextType | undefined>(undefined);

export function ApexProvider({ 
  children,
  initialWorkspaces = [],
  initialActiveWorkspace = null,
  initialTransactions = [],
  initialCategories = [],
  initialStats = { totalBalance: 0, weeklyExpense: 0, totalIncome: 0, totalExpense: 0 }
}: { 
  children: React.ReactNode;
  initialWorkspaces?: any[];
  initialActiveWorkspace?: any;
  initialTransactions?: any[];
  initialCategories?: any[];
  initialStats?: any;
}) {
  const [user] = useState<any>({ id: 1, full_name: 'Usuario', email: 'usuario@ejemplo.com' });
  const [workspaces] = useState<any[]>(initialWorkspaces);
  const [activeWorkspace, setActiveWorkspace] = useState<any>(initialActiveWorkspace);
  const [transactions, setTransactions] = useState<any[]>(initialTransactions);
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [stats, setStats] = useState<any>(initialStats);
  const [goals] = useState<any[]>([]);      
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransitionSwitch] = useTransition();

  const [optimisticTransactions, addOptimisticTransaction] = useOptimistic(
    transactions,
    (state, newTx: any) => [newTx, ...state]
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
      const expenses = optimisticTransactions.filter((t: any) => Number(t.amount) < 0);
      const nonEssentialSpend = Math.abs(expenses.filter((t: any) => !t.is_essential).reduce((acc: number, curr: any) => acc + Number(curr.amount), 0));
      const income = optimisticTransactions.filter((t: any) => Number(t.amount) > 0).reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
      
      const totalBudget = income > 0 ? income : 1;
      const penalty = (nonEssentialSpend / totalBudget) * 100;
      score = Math.max(0, 100 - penalty);
    } else {
      const expenses = optimisticTransactions.filter((t: any) => Number(t.amount) < 0);
      const burnRate = Math.abs(expenses.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0));
      const income = optimisticTransactions.filter((t: any) => Number(t.amount) > 0).reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
      
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
