import { pgTable, serial, text, integer, boolean, timestamp, numeric } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  full_name: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const workspaces = pgTable('workspaces', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  is_professional: boolean('is_professional').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  workspace_id: integer('workspace_id').references(() => workspaces.id).notNull(),
  name: text('name').notNull(),
  icon: text('icon'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  workspace_id: integer('workspace_id').references(() => workspaces.id).notNull(),
  category_id: integer('category_id').references(() => categories.id).notNull(),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  is_essential: boolean('is_essential').default(true).notNull(),
  date: timestamp('date').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const financial_goals = pgTable('financial_goals', {
  id: serial('id').primaryKey(),
  workspace_id: integer('workspace_id').references(() => workspaces.id).notNull(),
  name: text('name').notNull(),
  target_amount: numeric('target_amount', { precision: 12, scale: 2 }).notNull(),
  current_amount: numeric('current_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  deadline: timestamp('deadline'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});
