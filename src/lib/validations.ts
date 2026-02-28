import { z } from "zod";

export const transactionSchema = z.object({
  workspace_id: z.number().int().positive(),
  category_id: z.number().int().positive(),
  description: z.string().min(1, "La descripción es requerida").max(255),
  amount: z.number({
    required_error: "El monto es requerido",
    invalid_type_error: "El monto debe ser un número",
  }).positive("El monto no puede ser negativo o cero"),
  is_essential: z.boolean().default(true),
  date: z.date({
    required_error: "La fecha es requerida",
    invalid_type_error: "Esa no es una fecha válida",
  }),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const goalSchema = z.object({
  workspace_id: z.number().int().positive(),
  name: z.string().min(1, "El nombre de la meta es requerido").max(255),
  target_amount: z.number({
    required_error: "El monto objetivo es requerido",
    invalid_type_error: "El monto objetivo debe ser un número",
  }).positive("El monto objetivo debe ser mayor a cero"),
  current_amount: z.number().min(0).default(0),
  deadline: z.date().optional(),
});

export type GoalInput = z.infer<typeof goalSchema>;
