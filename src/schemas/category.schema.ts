import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "El nombre es requerido").max(50),
    type: z.enum(["INCOME", "EXPENSE"], {
      message: "Tipo debe ser INCOME o EXPENSE",
    }),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    type: z.enum(["INCOME", "EXPENSE"]).optional(),
  }),
});
