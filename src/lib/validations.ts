import { z } from "zod";

export const transactionSchema = z.object({
  workspace_id: z.number().int().positive(),
  category_id: z.number().int().positive(),
  description: z.string().min(1, "Description is required").max(255),
  amount: z.number({ error: "Amount is required or must be a number" }).positive("Amount cannot be negative or zero"),
  is_essential: z.boolean().default(true),
  date: z.date({ error: "Date is required or invalid" }),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const goalSchema = z.object({
  workspace_id: z.number().int().positive(),
  name: z.string().min(1, "Goal name is required").max(255),
  target_amount: z.number({ error: "Target amount is required or must be a number" }).positive("Target amount must be greater than zero"),
  current_amount: z.number().min(0).default(0),
  deadline: z.date().optional(),
});

export type GoalInput = z.infer<typeof goalSchema>;
