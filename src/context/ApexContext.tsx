"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { User, Workspace, Category, Transaction, FinancialGoal } from "../types";
import { mockUsers, mockWorkspaces, mockCategories, mockTransactions, mockGoals } from "../lib/mock-data";

interface ApexContextType {
  user: User;
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  setActiveWorkspace: (workspace: Workspace) => void;
  categories: Category[];
  transactions: Transaction[];
  goals: FinancialGoal[];
  apexScore: number;
}

const ApexContext = createContext<ApexContextType | undefined>(undefined);

export function ApexProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<User>(mockUsers[0]);
  const [workspaces] = useState<Workspace[]>(mockWorkspaces);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(mockWorkspaces[0]);

  // Derived data based on active workspace
  const categories = useMemo(() => 
    mockCategories.filter(c => c.workspace_id === activeWorkspace.id),
    [activeWorkspace]
  );

  const transactions = useMemo(() => 
    mockTransactions.filter(t => t.workspace_id === activeWorkspace.id),
    [activeWorkspace]
  );

  const goals = useMemo(() => 
    mockGoals.filter(g => g.workspace_id === activeWorkspace.id),
    [activeWorkspace]
  );

  // Calculate Apex Score based on the requested algorithm
  const apexScore = useMemo(() => {
    let score = 100;
    
    if (!activeWorkspace.is_professional) {
      // Personal: ApexScore = 100 − (NonEssentialSpend / TotalBudget × 100)
      const expenses = transactions.filter(t => t.amount < 0);
      const nonEssentialSpend = Math.abs(expenses.filter(t => !t.is_essential).reduce((acc, curr) => acc + curr.amount, 0));
      const income = transactions.filter(t => t.amount > 0).reduce((acc, curr) => acc + curr.amount, 0);
      
      // Assuming Income is the total budget for the month
      const totalBudget = income > 0 ? income : 1; // Prevent division by zero
      
      const penalty = (nonEssentialSpend / totalBudget) * 100;
      score = Math.max(0, 100 - penalty);
    } else {
      // Professional: ApexScore = 100 − (BurnRate / (Revenue + Investment) × 100)
      const expenses = transactions.filter(t => t.amount < 0);
      const burnRate = Math.abs(expenses.reduce((acc, curr) => acc + curr.amount, 0));
      const income = transactions.filter(t => t.amount > 0).reduce((acc, curr) => acc + curr.amount, 0);
      
      const totalIncome = income > 0 ? income : 1; // Prevent division by zero
      
      const penalty = (burnRate / totalIncome) * 100;
      score = Math.max(0, 100 - penalty);
    }

    return Math.round(score);
  }, [transactions, activeWorkspace]);

  // Apply theme class to document body based on workspace
  useEffect(() => {
    if (typeof document !== 'undefined') {
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
    transactions,
    goals,
    apexScore
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
