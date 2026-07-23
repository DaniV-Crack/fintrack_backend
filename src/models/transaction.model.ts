import { Transaction, TransactionType } from '@prisma/client';

export type TransactionPublic = Transaction;

export interface CreateTransactionDto {
  userId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  description?: string;
  transactionDate: Date;
}

export interface UpdateTransactionDto {
  categoryId?: string;
  amount?: number;
  type?: TransactionType;
  description?: string;
  transactionDate?: Date;
}