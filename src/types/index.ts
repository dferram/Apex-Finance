export type User = {
  id: number;
  full_name: string;
  email: string;
  created_at: Date;
};

export type Workspace = {
  id: number;
  user_id: number;
  name: string;
  is_professional: boolean;
  created_at: Date;
};

export type Category = {
  id: number;
  workspace_id: number;
  name: string;
  icon: string | null;
  created_at: Date;
};

export type Transaction = {
  id: number;
  workspace_id: number;
  category_id: number;
  description: string;
  amount: number;
  is_essential: boolean;
  date: Date;
  created_at: Date;
};

export type FinancialGoal = {
  id: number;
  workspace_id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: Date | null;
  created_at: Date;
};
