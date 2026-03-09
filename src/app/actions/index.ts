'use server';

import { db } from '@/lib/db';
import { workspaces, transactions, categories, financial_goals, partners, type Category, type TransactionWithCategory, type GoalWithNumbers } from '@/lib/schema';
import { eq, desc, sum, sql, and, gte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface CategoryNode extends Category {
  full_path: string;
  level: number;
}

export async function getWorkspaces() {
  try {
    const data = await db.select().from(workspaces).orderBy(workspaces.is_professional, desc(workspaces.id));
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

export async function getTransactions(workspaceId: number, limit?: number) {
  try {
    const baseQuery = db
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
    
    const data = limit ? await baseQuery.limit(limit) : await baseQuery;
      
    return data.map(t => ({
      ...t,
      amount: Number(t.amount || 0),
      date: t.date,
    })) as TransactionWithCategory[];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

/** Transactions for a given calendar day (YYYY-MM-DD). Use for Ledger pagination by day. Compares date part only to avoid timezone issues. */
export async function getTransactionsByDateRange(
  workspaceId: number,
  dateStr: string
): Promise<TransactionWithCategory[]> {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return [];
  }
  try {
    const data = await db
      .select({
        id: transactions.id,
        workspace_id: transactions.workspace_id,
        category_id: transactions.category_id,
        amount: transactions.amount,
        description: transactions.description,
        date: transactions.date,
        created_at: transactions.created_at,
        is_essential: transactions.is_essential,
        category: categories,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.category_id, categories.id))
      .where(
        and(
          eq(transactions.workspace_id, workspaceId),
          sql`(${transactions.date})::date = (${dateStr}::date)`
        )
      )
      .orderBy(desc(transactions.date), desc(transactions.id));

    return data.map((t) => ({
      ...t,
      amount: Number(t.amount || 0),
      date: t.date,
      created_at: t.created_at ? new Date(t.created_at).toISOString() : undefined,
    })) as TransactionWithCategory[];
  } catch (error) {
    console.error('Error fetching transactions by date range:', error);
    return [];
  }
}

/** Daily income/expense totals: 15 days before today, today, 14 days after (today in center). Fetches all txs for workspace then filters in JS to avoid DB date/timezone issues. */
export async function getCashFlowPulseData(workspaceId: number): Promise<
  { dateKey: string; dateLabel: string; Income: number; Expenses: number; Balance: number; Accumulated: number }[]
> {
  try {
    const txs = await db
      .select({ date: transactions.date, amount: transactions.amount })
      .from(transactions)
      .where(eq(transactions.workspace_id, workspaceId));

    const now = new Date();
    const dayMap = new Map<string, { Income: number; Expenses: number }>();

    for (const t of txs) {
      const dateKey = getTxDateKey(t.date, now);
      const d = parseDateKey(dateKey);
      if (!d || d.getTime() > now.getTime()) continue;
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays > 15) continue;
      const future = Math.floor((d.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      if (future > 14) continue;

      const val = Number(t.amount || 0);
      const current = dayMap.get(dateKey) ?? { Income: 0, Expenses: 0 };
      if (val > 0) current.Income += val;
      else current.Expenses += Math.abs(val);
      dayMap.set(dateKey, current);
    }

    const result: { dateKey: string; dateLabel: string; Income: number; Expenses: number; Balance: number; Accumulated: number }[] = [];
    let accumulated = 0;
    for (let i = -15; i <= 14; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      const dateKey = d.toISOString().slice(0, 10);
      const { Income, Expenses } = dayMap.get(dateKey) ?? { Income: 0, Expenses: 0 };
      const Balance = Income - Expenses;
      accumulated += Balance;
      result.push({
        dateKey,
        dateLabel: d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
        Income,
        Expenses,
        Balance,
        Accumulated: accumulated,
      });
    }

    return result;
  } catch (error) {
    console.error("Error fetching cash flow pulse data:", error);
    return [];
  }
}

/** Date key for a tx; if date is null (DB has no date), use today (UTC) so the tx still appears in charts. */
function getTxDateKey(date: unknown, fallbackNow: Date): string {
  const key = getDateKey(date);
  if (key) return key;
  try {
    const k = fallbackNow.toISOString().slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(k) ? k : `${fallbackNow.getFullYear()}-${String(fallbackNow.getMonth() + 1).padStart(2, "0")}-${String(fallbackNow.getDate()).padStart(2, "0")}`;
  } catch {
    return `${fallbackNow.getFullYear()}-${String(fallbackNow.getMonth() + 1).padStart(2, "0")}-${String(fallbackNow.getDate()).padStart(2, "0")}`;
  }
}

/** Safe date key (YYYY-MM-DD) from DB value; never throws. Uses UTC date part for timestamps so grouping is consistent regardless of server timezone. */
function getDateKey(date: unknown): string | null {
  if (date == null) return null;
  if (typeof date === 'number' && !Number.isNaN(date)) {
    try {
      const key = new Date(date).toISOString().slice(0, 10);
      return /^\d{4}-\d{2}-\d{2}$/.test(key) ? key : null;
    } catch {
      return null;
    }
  }
  if (typeof date === 'string') {
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    try {
      const d = new Date(date);
      if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    } catch {
      // ignore
    }
    return null;
  }
  if (date instanceof Date) {
    if (Number.isNaN(date.getTime())) return null;
    try {
      const key = date.toISOString().slice(0, 10);
      return /^\d{4}-\d{2}-\d{2}$/.test(key) ? key : null;
    } catch {
      return null;
    }
  }
  if (typeof date === 'object' && date !== null) {
    const o = date as { toISOString?: () => string; getTime?: () => number; valueOf?: () => number };
    let d: Date | null = null;
    if (typeof o.toISOString === 'function') {
      try {
        d = new Date(o.toISOString());
      } catch {
        return null;
      }
    } else if (typeof o.getTime === 'function') {
      const t = o.getTime();
      if (typeof t === 'number' && !Number.isNaN(t)) d = new Date(t);
    } else if (typeof o.valueOf === 'function') {
      const t = o.valueOf();
      if (typeof t === 'number' && !Number.isNaN(t)) d = new Date(t);
    }
    if (d && !Number.isNaN(d.getTime())) {
      try {
        const key = d.toISOString().slice(0, 10);
        return /^\d{4}-\d{2}-\d{2}$/.test(key) ? key : null;
      } catch {
        return null;
      }
    }
  }
  return null;
}

function parseDateKey(key: string): Date | null {
  const [y, m, d] = key.split("-").map(Number);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  return Number.isNaN(date.getTime()) ? null : date;
}

export type ReportChartItem = { name: string; Income: number; Expenses: number };

/** Report chart data from server so Reports page always has data (day/week/month, current period in center). */
export async function getReportChartData(
  workspaceId: number,
  filterRange: "day" | "week" | "month"
): Promise<ReportChartItem[]> {
  try {
    const txs = await db
      .select({ date: transactions.date, amount: transactions.amount })
      .from(transactions)
      .where(eq(transactions.workspace_id, workspaceId));

    const now = new Date();
    now.setHours(23, 59, 59, 999);

    if (filterRange === "day") {
      const dayTotals = new Map<string, { income: number; expenses: number }>();
      for (const tx of txs) {
        const key = getTxDateKey(tx.date, now);
        const txDate = parseDateKey(key);
        if (txDate && txDate.getTime() > now.getTime()) continue;
        if (!dayTotals.has(key)) dayTotals.set(key, { income: 0, expenses: 0 });
        const t = dayTotals.get(key)!;
        const amt = Number(tx.amount || 0);
        if (amt > 0) t.income += amt;
        else t.expenses += Math.abs(amt);
      }
      const points: ReportChartItem[] = [];
      for (let i = -15; i <= 15; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        d.setHours(0, 0, 0, 0);
        const key = d.toISOString().slice(0, 10);
        const t = dayTotals.get(key) ?? { income: 0, expenses: 0 };
        points.push({
          name: d.toLocaleDateString("default", { day: "2-digit", month: "short" }),
          Income: t.income,
          Expenses: t.expenses,
        });
      }
      return points;
    }

    if (filterRange === "week") {
      const weekTotals = new Map<string, { income: number; expenses: number }>();
      for (const tx of txs) {
        const key = getTxDateKey(tx.date, now);
        const txDate = parseDateKey(key);
        if (!txDate || txDate.getTime() > now.getTime()) continue;
        const weekStart = new Date(Date.UTC(txDate.getUTCFullYear(), txDate.getUTCMonth(), txDate.getUTCDate() - txDate.getUTCDay()));
        const weekKey = weekStart.toISOString().slice(0, 10);
        if (!weekTotals.has(weekKey)) weekTotals.set(weekKey, { income: 0, expenses: 0 });
        const t = weekTotals.get(weekKey)!;
        const amt = Number(tx.amount || 0);
        if (amt > 0) t.income += amt;
        else t.expenses += Math.abs(amt);
      }
      const points: ReportChartItem[] = [];
      for (let i = -6; i <= 5; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - d.getDay() + i * 7);
        d.setHours(0, 0, 0, 0);
        const weekStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - d.getUTCDay()));
        const key = weekStart.toISOString().slice(0, 10);
        const weekEnd = new Date(weekStart);
        weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
        const t = weekTotals.get(key) ?? { income: 0, expenses: 0 };
        points.push({
          name: `${weekStart.toLocaleDateString("default", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("default", { month: "short", day: "numeric" })}`,
          Income: t.income,
          Expenses: t.expenses,
        });
      }
      return points;
    }

    const monthTotals = new Map<string, { income: number; expenses: number }>();
    for (const tx of txs) {
      const key = getTxDateKey(tx.date, now);
      const monthKey = key.slice(0, 7);
      const txDate = parseDateKey(key);
      if (txDate && txDate.getTime() > now.getTime()) continue;
      if (!monthTotals.has(monthKey)) monthTotals.set(monthKey, { income: 0, expenses: 0 });
      const t = monthTotals.get(monthKey)!;
      const amt = Number(tx.amount || 0);
      if (amt > 0) t.income += amt;
      else t.expenses += Math.abs(amt);
    }
    const points: ReportChartItem[] = [];
    for (let i = -6; i <= 5; i++) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1));
      const key = d.toISOString().slice(0, 7);
      const t = monthTotals.get(key) ?? { income: 0, expenses: 0 };
      points.push({
        name: d.toLocaleDateString("default", { month: "short", year: d.getUTCFullYear() !== now.getUTCFullYear() ? "2-digit" : undefined }),
        Income: t.income,
        Expenses: t.expenses,
      });
    }
    return points;
  } catch (error) {
    console.error("Error fetching report chart data:", error);
    return [];
  }
}

interface CreateTransactionData {
  workspace_id: number;
  category_id: number;
  amount: number;
  description: string;
  date?: Date | string;
  is_essential?: boolean;
}

function toValidDateString(value: Date | string | null | undefined): string {
  if (value == null) {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? new Date().toISOString().slice(0, 10) : value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

export async function createTransaction(data: CreateTransactionData) {
  try {
    const dateValue = toValidDateString(data.date);
    await db.insert(transactions).values({
      workspace_id: data.workspace_id,
      category_id: data.category_id,
      amount: data.amount.toString(),
      description: data.description,
      date: dateValue,
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
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

    const weeklyExpensesResult = await db
      .select({
        total: sum(sql`CAST(${transactions.amount} AS NUMERIC)`),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.workspace_id, workspaceId),
          sql`CAST(${transactions.amount} AS NUMERIC) < 0`,
          gte(transactions.date, sevenDaysAgoStr)
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
  data: { amount?: number; description?: string; category_id?: number; date?: Date | string; is_essential?: boolean }
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(transactions)
      .set({
        ...(data.amount !== undefined && { amount: data.amount.toString() }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category_id !== undefined && { category_id: data.category_id }),
        ...(data.date !== undefined && { date: toValidDateString(data.date) }),
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
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting goal:', error);
    return { success: false, error: 'Failed to delete goal' };
  }
}

// Partners CRUD
export async function getPartners(workspaceId: number) {
  try {
    const data = await db.select().from(partners).where(eq(partners.workspace_id, workspaceId)).orderBy(desc(partners.percentage));
    return data;
  } catch (error) {
    console.error('Error fetching partners:', error);
    return [];
  }
}

export async function createPartner(data: { workspace_id: number; name: string; percentage: number; email?: string }) {
  try {
    const [partner] = await db.insert(partners).values({
      workspace_id: data.workspace_id,
      name: data.name,
      percentage: data.percentage.toString(),
      email: data.email || null,
    }).returning();
    revalidatePath('/reports');
    return { success: true, partner };
  } catch (error) {
    console.error('Error creating partner:', error);
    return { success: false, error: 'Failed to create partner' };
  }
}

export async function updatePartner(id: number, data: { name?: string; percentage?: number; email?: string }) {
  try {
    const updateData: Record<string, string | number | null> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.percentage !== undefined) updateData.percentage = data.percentage.toString();
    if (data.email !== undefined) updateData.email = data.email || null;

    await db.update(partners).set(updateData).where(eq(partners.id, id));
    revalidatePath('/reports');
    return { success: true };
  } catch (error) {
    console.error('Error updating partner:', error);
    return { success: false, error: 'Failed to update partner' };
  }
}

export async function deletePartner(id: number) {
  try {
    await db.delete(partners).where(eq(partners.id, id));
    revalidatePath('/reports');
    return { success: true };
  } catch (error) {
    console.error('Error deleting partner:', error);
    return { success: false, error: 'Failed to delete partner' };
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
