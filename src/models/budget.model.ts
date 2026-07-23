import { Budget } from '@prisma/client';

export type BudgetPublic = Budget;

export interface CreateBudgetDto {
  userId: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

export interface UpdateBudgetDto {
  amount?: number;
  month?: number;
  year?: number;
}