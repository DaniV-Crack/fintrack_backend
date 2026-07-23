import { Category, TransactionType } from "@prisma/client";

export type CategoryPublic = Category;

export interface CreateCategoryDto {
  userId: string;
  name: string;
  type: TransactionType;
}

export interface UpdateCategoryDto {
  name?: string;
  type?: TransactionType;
}
