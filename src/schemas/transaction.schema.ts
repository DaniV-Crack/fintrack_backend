import { z } from "zod";

export const createTransactionSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid("categoryId debe ser un UUID válido"),
    amount: z
      .number()
      .positive("El monto debe ser positivo")
      .finite("Monto inválido"),
    type: z.enum(["INCOME", "EXPENSE"], {
      message: "Tipo debe ser INCOME o EXPENSE",
    }),
    description: z.string().max(200).optional(),
    transactionDate: z.string().datetime({ message: "Fecha inválida" }),
  }),
});

export const updateTransactionSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid("categoryId debe ser un UUID válido").optional(),
    amount: z.number().positive("El monto debe ser positivo").finite().optional(),
    type: z.enum(["INCOME", "EXPENSE"]).optional(),
    description: z.string().max(200).optional(),
    transactionDate: z.string().datetime({ message: "Fecha inválida" }).optional(),
  }),
});
