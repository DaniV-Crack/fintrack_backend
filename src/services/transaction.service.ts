import { Prisma, TransactionType } from "@prisma/client";
import prisma from "../config/prisma";
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from "../models/transaction.model";

interface FindAllParams {
  userId: string;
  categoryId?: string;
  type?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export const transactionService = {
  async findAll(params: FindAllParams) {
    const { userId, categoryId, type, dateFrom, dateTo, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = { userId };
    if (categoryId) where.categoryId = categoryId;
    if (type) where.type = type;
    if (dateFrom || dateTo) {
      where.transactionDate = {};
      if (dateFrom) where.transactionDate.gte = new Date(dateFrom);
      if (dateTo) where.transactionDate.lte = new Date(dateTo);
    }

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { transactionDate: "desc" },
        skip,
        take: limit,
        include: { category: { select: { id: true, name: true, type: true } } },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: data.map((t) => ({
        ...t,
        amount: t.amount.toNumber(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string, userId: string) {
    const tx = await prisma.transaction.findFirst({
      where: { id, userId },
      include: { category: { select: { id: true, name: true, type: true } } },
    });
    if (!tx) return null;
    return { ...tx, amount: tx.amount.toNumber() };
  },

  async create(data: CreateTransactionDto) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, userId: data.userId },
    });
    if (!category) {
      throw {
        status: 404,
        message: "Categoría no encontrada o no pertenece al usuario",
      };
    }
    if (category.type !== data.type) {
      throw {
        status: 400,
        message: `La categoría "${category.name}" es de tipo ${category.type}, no coincide con ${data.type}`,
      };
    }
    const tx = await prisma.transaction.create({
      data: {
        userId: data.userId,
        categoryId: data.categoryId,
        amount: data.amount,
        type: data.type,
        description: data.description,
        transactionDate: new Date(data.transactionDate),
      },
      include: { category: { select: { id: true, name: true, type: true } } },
    });
    return { ...tx, amount: tx.amount.toNumber() };
  },

  async update(id: string, userId: string, data: UpdateTransactionDto) {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) throw { status: 404, message: "Transacción no encontrada" };

    const categoryId = data.categoryId ?? existing.categoryId;
    const type = data.type ?? existing.type;

    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId },
    });
    if (!category) {
      throw {
        status: 404,
        message: "Categoría no encontrada o no pertenece al usuario",
      };
    }
    if (category.type !== type) {
      throw {
        status: 400,
        message: `La categoría "${category.name}" es de tipo ${category.type}, no coincide con ${type}`,
      };
    }

    const updateData: Prisma.TransactionUpdateInput = {};
    if (data.categoryId) updateData.category = { connect: { id: data.categoryId } };
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.type) updateData.type = data.type;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.transactionDate) updateData.transactionDate = new Date(data.transactionDate);

    const tx = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: { category: { select: { id: true, name: true, type: true } } },
    });
    return { ...tx, amount: tx.amount.toNumber() };
  },

  async remove(id: string, userId: string) {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) throw { status: 404, message: "Transacción no encontrada" };
    await prisma.transaction.delete({ where: { id } });
  },

  async getSummary(userId: string, month?: number, year?: number) {
    const where: Prisma.TransactionWhereInput = { userId };
    if (month !== undefined || year !== undefined) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (year) {
        dateFilter.gte = new Date(year, month ? month - 1 : 0, 1);
        dateFilter.lt = new Date(year, month ?? 11, 31, 23, 59, 59, 999);
      } else if (month !== undefined) {
        const now = new Date();
        dateFilter.gte = new Date(now.getFullYear(), month - 1, 1);
        dateFilter.lt = new Date(now.getFullYear(), month, 0, 23, 59, 59, 999);
      }
      where.transactionDate = dateFilter;
    }

    const aggregation = await prisma.transaction.groupBy({
      by: ["type"],
      where,
      _sum: { amount: true },
    });

    const totalIncome =
      aggregation
        .find((a) => a.type === "INCOME")
        ?._sum?.amount?.toNumber() ?? 0;
    const totalExpense =
      aggregation
        .find((a) => a.type === "EXPENSE")
        ?._sum?.amount?.toNumber() ?? 0;

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  },
};
