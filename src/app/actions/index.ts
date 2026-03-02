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

// ── Category mutations ──────────────────────────────────────────────────────

export async function updateCategory(
  id: number,
  data: { name?: string; parent_id?: number | null; monthly_budget?: number | null; is_project?: boolean }
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(categories)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.parent_id !== undefined && { parent_id: data.parent_id }),
        ...(data.monthly_budget !== undefined && { monthly_budget: data.monthly_budget !== null ? data.monthly_budget.toString() : null }),
        ...(data.is_project !== undefined && { is_project: data.is_project }),
      })
      .where(eq(categories.id, id));
    revalidatePath('/');
    revalidatePath('/categories');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error updating category:', error);
    return { success: false, error: 'Could not update category' };
  }
}

export async function deleteCategory(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const children = await db.select({ id: categories.id }).from(categories).where(eq(categories.parent_id, id));
    if (children.length > 0) {
      return { success: false, error: `Esta categoría tiene ${children.length} subcategoría(s). Elimínalas primero.` };
    }
    const txs = await db.select({ id: transactions.id }).from(transactions).where(eq(transactions.category_id, id));
    if (txs.length > 0) {
      return { success: false, error: `Esta categoría tiene ${txs.length} transacción(es) asociada(s). Reasígnalas primero.` };
    }
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath('/');
    revalidatePath('/categories');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: 'Could not delete category' };
  }
}

export async function moveCategoryParent(
  categoryId: number,
  newParentId: number | null
): Promise<{ success: boolean; error?: string }> {
  try {
    // Cycle detection: newParentId must not be a descendant of categoryId
    if (newParentId !== null) {
      const descendants = await db.execute(sql`
        WITH RECURSIVE subtree AS (
          SELECT id FROM categories WHERE id = ${categoryId}
          UNION ALL
          SELECT c.id FROM categories c JOIN subtree s ON c.parent_id = s.id
        )
        SELECT id FROM subtree
      `);
      const descendantIds = (descendants.rows as { id: number }[]).map(r => Number(r.id));
      if (descendantIds.includes(newParentId)) {
        return { success: false, error: 'No se puede mover una categoría dentro de sus propios descendientes.' };
      }
    }
    await db.update(categories).set({ parent_id: newParentId }).where(eq(categories.id, categoryId));
    revalidatePath('/');
    revalidatePath('/categories');
    return { success: true };
  } catch (error) {
    console.error('Error moving category:', error);
    return { success: false, error: 'Could not move category' };
  }
}

// ── Transaction mutations ───────────────────────────────────────────────────

export async function updateTransaction(
  id: number,
  data: { amount?: number; description?: string; category_id?: number; date?: Date; is_essential?: boolean }
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(transactions)
      .set({
        ...(data.amount !== undefined && { amount: data.amount.toString() }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category_id !== undefined && { category_id: data.category_id }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.is_essential !== undefined && { is_essential: data.is_essential }),
      })
      .where(eq(transactions.id, id));
    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error updating transaction:', error);
    return { success: false, error: 'Could not update transaction' };
  }
}

export async function deleteTransaction(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    await db.delete(transactions).where(eq(transactions.id, id));
    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return { success: false, error: 'Could not delete transaction' };
  }
}

// ── Goal mutations ──────────────────────────────────────────────────────────

export async function updateGoal(
  id: number,
  data: { name?: string; target_amount?: number; current_amount?: number; deadline?: Date | null }
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(financial_goals)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.target_amount !== undefined && { target_amount: data.target_amount.toString() }),
        ...(data.current_amount !== undefined && { current_amount: data.current_amount.toString() }),
        ...(data.deadline !== undefined && { deadline: data.deadline }),
      })
      .where(eq(financial_goals.id, id));
    revalidatePath('/goals');
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error updating goal:', error);
    return { success: false, error: 'Could not update goal' };
  }
}

export async function deleteGoal(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    await db.delete(financial_goals).where(eq(financial_goals.id, id));
    revalidatePath('/goals');
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting goal:', error);
    return { success: false, error: 'Could not delete goal' };
  }
}

// ── Workspace mutations ─────────────────────────────────────────────────────

export async function updateWorkspace(
  id: number,
  data: { name?: string; currency?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(workspaces)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.currency !== undefined && { currency: data.currency }),
      })
      .where(eq(workspaces.id, id));
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error updating workspace:', error);
    return { success: false, error: 'Could not update workspace' };
  }
}
