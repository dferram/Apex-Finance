'use server';

import { db } from '@/lib/db';
import { workspaces, transactions, categories, financial_goals } from '@/lib/schema';
import { eq, desc, sum, sql, and, gte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

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
    const data = await db.select().from(categories).where(eq(categories.workspace_id, workspaceId));
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getTransactions(workspaceId: number) {
  try {
    const data = await db
      .select({
        id: transactions.id,
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
    }));
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
