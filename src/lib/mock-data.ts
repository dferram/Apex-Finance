import { User, Workspace, Category, Transaction, FinancialGoal } from "../types";

const now = new Date();
const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

export const mockUsers: User[] = [
  { id: 1, full_name: "Apex User", email: "user@apexfinance.com", created_at: lastMonth }
];

export const mockWorkspaces: Workspace[] = [
  { id: 1, user_id: 1, name: "Personal Track", is_professional: false, created_at: lastMonth },
  { id: 2, user_id: 1, name: "xCore Engineering", is_professional: true, created_at: lastMonth }
];

export const mockCategories: Category[] = [
  // Personal Categories
  { id: 1, workspace_id: 1, name: "Housing", icon: "Home", created_at: lastMonth },
  { id: 2, workspace_id: 1, name: "Food", icon: "Coffee", created_at: lastMonth },
  { id: 3, workspace_id: 1, name: "Transportation", icon: "Car", created_at: lastMonth },
  { id: 4, workspace_id: 1, name: "Entertainment", icon: "Gamepad2", created_at: lastMonth }, // Non-essential
  { id: 5, workspace_id: 1, name: "Luxury", icon: "Gem", created_at: lastMonth }, // Non-essential
  { id: 6, workspace_id: 1, name: "Salary", icon: "Wallet", created_at: lastMonth }, // Income
  
  // Professional Categories
  { id: 7, workspace_id: 2, name: "Payroll", icon: "Users", created_at: lastMonth },
  { id: 8, workspace_id: 2, name: "Infrastructure (AWS)", icon: "Server", created_at: lastMonth },
  { id: 9, workspace_id: 2, name: "Marketing", icon: "Megaphone", created_at: lastMonth }, // Non-essential depending on stage
  { id: 10, workspace_id: 2, name: "SaaS Revenue", icon: "TrendingUp", created_at: lastMonth }, // Income
  { id: 11, workspace_id: 2, name: "Investment Round", icon: "Briefcase", created_at: lastMonth }, // Income
];

export const mockTransactions: Transaction[] = [
  // Personal (Workspace 1) - Income
  { id: 1, workspace_id: 1, category_id: 6, description: "Biweekly Salary", amount: 2500.00, is_essential: true, date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14), created_at: lastMonth },
  // Personal (Workspace 1) - Expenses Essential
  { id: 2, workspace_id: 1, category_id: 1, description: "Rent", amount: -800.00, is_essential: true, date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 12), created_at: lastMonth },
  { id: 3, workspace_id: 1, category_id: 2, description: "Grocery Shopping", amount: -250.00, is_essential: true, date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5), created_at: lastMonth },
  // Personal (Workspace 1) - Expenses Non-Essential
  { id: 4, workspace_id: 1, category_id: 4, description: "Subscriptions (Netflix, Spotify)", amount: -45.00, is_essential: false, date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3), created_at: lastMonth },
  { id: 5, workspace_id: 1, category_id: 5, description: "Restaurant Dinner", amount: -120.00, is_essential: false, date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2), created_at: lastMonth },
  
  // Professional (Workspace 2) - Income
  { id: 6, workspace_id: 2, category_id: 10, description: "MRR Subscriptions", amount: 15000.00, is_essential: true, date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10), created_at: lastMonth },
  { id: 7, workspace_id: 2, category_id: 11, description: "Seed Round (Tranche 1)", amount: 50000.00, is_essential: true, date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 20), created_at: lastMonth },
  // Professional (Workspace 2) - Expenses
  { id: 8, workspace_id: 2, category_id: 7, description: "Development Team Payroll", amount: -18000.00, is_essential: true, date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5), created_at: lastMonth },
  { id: 9, workspace_id: 2, category_id: 8, description: "AWS Billing", amount: -1200.00, is_essential: true, date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2), created_at: lastMonth },
  { id: 10, workspace_id: 2, category_id: 9, description: "LinkedIn Ads Campaign", amount: -3500.00, is_essential: false, date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1), created_at: lastMonth },
];

export const mockGoals: FinancialGoal[] = [
  { id: 1, workspace_id: 1, name: "Porsche 911 Down Payment", target_amount: 35000.00, current_amount: 8500.00, deadline: new Date(now.getFullYear() + 2, 11, 31), created_at: lastMonth },
  { id: 2, workspace_id: 1, name: "Emergency Fund", target_amount: 10000.00, current_amount: 10000.00, deadline: null, created_at: lastMonth },
  { id: 3, workspace_id: 2, name: "Minimum Runway (12 months)", target_amount: 250000.00, current_amount: 65000.00, deadline: new Date(now.getFullYear() + 1, 5, 30), created_at: lastMonth }
];
