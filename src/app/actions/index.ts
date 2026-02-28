'use server';

import { db } from '@/lib/db';
import { workspaces, transactions, categories, financial_goals, type Category, type TransactionWithCategory, type GoalWithNumbers } from '@/lib/schema';
import { eq, desc, sum, sql, and, gte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface CategoryNode extends Category {
  full_path: string;
  level: number;
}

export async function getWorkspaces() {
  try {
    const data = await db.select().from(workspaces).orderBy(desc(workspaces.id));
    return data;
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return [];
  }
}

export async function getCategories(workspaceId: number) {
  try {
    const data = await db.select().from(categories).where(eq(categories.workspace_id, workspaceId)).orderBy(categories.name);
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getCategoriesHierarchical(workspaceId: number) {
  try {
    const data = await db.execute(sql`
      WITH RECURSIVE category_tree AS (
        SELECT 
          id, 
          workspace_id, 
          parent_id, 
          name, 
          monthly_budget, 
          is_project,
          name::text AS full_path,
          1 AS level
        FROM categories
        WHERE workspace_id = ${workspaceId} AND parent_id IS NULL

        UNION ALL

        SELECT 
          c.id, 
          c.workspace_id, 
          c.parent_id, 
          c.name, 
          c.monthly_budget, 
          c.is_project,
          (ct.full_path || ' / ' || c.name) AS full_path,
          ct.level + 1 AS level
        FROM categories c
        JOIN category_tree ct ON c.parent_id = ct.id
      )
      SELECT * FROM category_tree ORDER BY full_path;
    `);
    return data.rows as unknown as CategoryNode[];
  } catch (error) {
    console.error('Error fetching hierarchical categories:', error);
    return [];
  }
}

export async function getCategoryTotalsHierarchical(workspaceId: number) {
  try {
    const data = await db.execute(sql`
      WITH RECURSIVE category_tree AS (
        SELECT id, parent_id FROM categories WHERE workspace_id = ${workspaceId}
      ),
      all_descendants AS (
        SELECT id AS root_id, id AS descendant_id FROM category_tree
        UNION ALL
        SELECT ad.root_id, ct.id FROM all_descendants ad
        JOIN category_tree ct ON ad.descendant_id = ct.parent_id
      )
      SELECT 
        ad.root_id as category_id,
        SUM(CAST(t.amount AS NUMERIC)) as total_amount
      FROM all_descendants ad
      JOIN transactions t ON ad.descendant_id = t.category_id
      WHERE t.workspace_id = ${workspaceId}
      GROUP BY ad.root_id;
    `);
    return data.rows as { category_id: number; total_amount: string }[];
  } catch (error) {
    console.error('Error fetching hierarchical category totals:', error);
    return [];
  }
}

export async function getTransactions(workspaceId: number) {
  try {
    const data = await db
      .select({
        id: transactions.id,
        workspace_id: transactions.workspace_id,
        category_id: transactions.category_id,
        amount: transactions.amount,
        description: transactions.description,
        date: transactions.date,
        is_essential: transactions.is_essential,
        category: categories,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.category_id, categories.id))
      .where(eq(transactions.workspace_id, workspaceId))
      .orderBy(desc(transactions.date), desc(transactions.id));
      
    // Transform decimal to number
    return data.map(t => ({
      ...t,
      amount: Number(t.amount || 0),
    })) as TransactionWithCategory[];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

interface CreateTransactionData {
  workspace_id: number;
  category_id: number;
  amount: number;
  description: string;
  date?: Date;
  is_essential?: boolean;
}

export async function createTransaction(data: CreateTransactionData) {
  try {
    await db.insert(transactions).values({
      workspace_id: data.workspace_id,
      category_id: data.category_id,
      amount: data.amount.toString(),
      description: data.description,
      date: data.date || new Date(),
      is_essential: data.is_essential ?? true,
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return { success: false, error: 'Could not create transaction' };
  }
}

export async function getApexStats(workspaceId: number) {
  try {
    const txs = await db
      .select({
        amount: transactions.amount,
      })
      .from(transactions)
      .where(eq(transactions.workspace_id, workspaceId));

    let totalIncome = 0;
    let totalExpense = 0;

    for (const tx of txs) {
      const val = Number(tx.amount || 0);
      if (val > 0) totalIncome += val;
      else totalExpense += Math.abs(val);
    }
    
    const totalBalance = totalIncome - totalExpense;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyExpensesResult = await db
      .select({
        total: sum(sql`CAST(${transactions.amount} AS NUMERIC)`),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.workspace_id, workspaceId),
          sql`CAST(${transactions.amount} AS NUMERIC) < 0`,
          gte(transactions.date, sevenDaysAgo)
        )
      );

    const weeklyExpense = Math.abs(Number(weeklyExpensesResult[0]?.total || 0));

    return {
      totalBalance,
      weeklyExpense,
      totalIncome,
      totalExpense
    };
  } catch (error) {
    console.error('Error calculating Apex Stats:', error);
    return {
      totalBalance: 0,
      weeklyExpense: 0,
      totalIncome: 0,
      totalExpense: 0
    };
  }
}

export async function createCategory(data: { workspace_id: number; name: string; monthly_budget?: number; parent_id?: number; is_project?: boolean }) {
  try {
    await db.insert(categories).values({
      workspace_id: data.workspace_id,
      name: data.name,
      monthly_budget: data.monthly_budget?.toString(),
      parent_id: data.parent_id,
      is_project: data.is_project ?? false,
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error creating category:', error);
    return { success: false, error: 'Could not create category' };
  }
}

export async function createFinancialGoal(data: { user_id: number; name: string; target_amount: number; deadline?: Date }) {
  try {
    await db.insert(financial_goals).values({
      user_id: data.user_id,
      name: data.name,
      target_amount: data.target_amount.toString(),
      current_amount: '0',
      deadline: data.deadline,
    });
    revalidatePath('/goals');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error creating goal:', error);
    return { success: false, error: 'Could not create goal' };
  }
}

export async function getFinancialGoals(userId: number) {
  try {
    const data = await db.select().from(financial_goals).where(eq(financial_goals.user_id, userId));
    return data.map(g => ({
      ...g,
      target_amount: Number(g.target_amount || 0),
      current_amount: Number(g.current_amount || 0),
    })) as GoalWithNumbers[];
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
}
