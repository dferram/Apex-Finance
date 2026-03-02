import { z } from "zod";

export const transactionSchema = z.object({
  workspace_id: z.number().int().positive(),
  category_id: z.number().int().positive(),
  description: z.string().min(1, "La descripción es requerida").max(255),
  amount: z.number({ error: "El monto es requerido o debe ser un número" }).positive("El monto no puede ser negativo o cero"),
  is_essential: z.boolean().default(true),
  date: z.date({ error: "La fecha es requerida o no es válida" }),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const goalSchema = z.object({
  workspace_id: z.number().int().positive(),
  name: z.string().min(1, "El nombre de la meta es requerido").max(255),
  target_amount: z.number({ error: "El monto objetivo es requerido o debe ser un número" }).positive("El monto objetivo debe ser mayor a cero"),
  current_amount: z.number().min(0).default(0),
  deadline: z.date().optional(),
});

export type GoalInput = z.infer<typeof goalSchema>;
