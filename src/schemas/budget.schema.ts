import { z } from "zod";

export const createBudgetSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid("categoryId debe ser un UUID válido"),
    amount: z
      .number()
      .positive("El monto debe ser positivo")
      .finite("Monto inválido"),
    month: z
      .number()
      .int()
      .min(1, "Mes debe estar entre 1 y 12")
      .max(12, "Mes debe estar entre 1 y 12"),
    year: z
      .number()
      .int()
      .min(2000, "Año inválido")
      .max(2100, "Año inválido"),
  }),
});

export const updateBudgetSchema = z.object({
  body: z.object({
    amount: z.number().positive().finite().optional(),
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(2000).max(2100).optional(),
  }),
});
