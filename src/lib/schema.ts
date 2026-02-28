import { pgTable, text, timestamp, boolean, decimal, bigserial, integer, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tablas basadas en inspección real de la DB
export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  created_at: timestamp('created_at'),
});

export const workspaces = pgTable('workspaces', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  is_professional: boolean('is_professional').default(false),
  currency: text('currency'),
});

export const categories = pgTable('categories', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  workspace_id: integer('workspace_id').references(() => workspaces.id),
  name: text('name').notNull(),
  monthly_budget: numeric('monthly_budget'),
});

export const transactions = pgTable('transactions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  workspace_id: integer('workspace_id').references(() => workspaces.id).notNull(),
  category_id: integer('category_id').references(() => categories.id).notNull(),
  amount: numeric('amount').notNull(),
  description: text('description').notNull(),
  is_essential: boolean('is_essential').default(true),
  date: timestamp('date'),
});

export const financial_goals = pgTable('financial_goals', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  target_amount: numeric('target_amount').notNull(),
  current_amount: numeric('current_amount').default('0'),
  deadline: timestamp('deadline'),
});

// Relaciones
export const usersRelations = relations(users, ({ many }) => ({
  workspaces: many(workspaces),
  financial_goals: many(financial_goals),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  user: one(users, {
    fields: [workspaces.user_id],
    references: [users.id],
  }),
  categories: many(categories),
  transactions: many(transactions),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [categories.workspace_id],
    references: [workspaces.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [transactions.workspace_id],
    references: [workspaces.id],
  }),
  category: one(categories, {
    fields: [transactions.category_id],
    references: [categories.id],
  }),
}));

export const financialGoalsRelations = relations(financial_goals, ({ one }) => ({
  user: one(users, {
    fields: [financial_goals.user_id],
    references: [users.id],
  }),
}));
