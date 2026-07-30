import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";
import {
  CreateBudgetDto,
  UpdateBudgetDto,
} from "../models/budget.model";

export const budgetService = {
  async findAll(userId: string, month?: number, year?: number) {
    const where: Prisma.BudgetWhereInput = { userId };
    if (month !== undefined) where.month = month;
    if (year !== undefined) where.year = year;

    return prisma.budget.findMany({
      where,
      include: { category: { select: { id: true, name: true, type: true } } },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
  },

  async findById(id: string, userId: string) {
    return prisma.budget.findFirst({
      where: { id, userId },
      include: { category: { select: { id: true, name: true, type: true } } },
    });
  },

  async create(data: CreateBudgetDto) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, userId: data.userId },
    });
    if (!category) {
      throw {
        status: 404,
        message: "Categoría no encontrada o no pertenece al usuario",
      };
    }
    try {
      return await prisma.budget.create({
        data,
        include: { category: { select: { id: true, name: true, type: true } } },
      });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw {
            status: 409,
            message:
              "Ya existe un presupuesto para esta categoría en el mes y año indicados",
          };
        }
      }
      throw e;
    }
  },

  async update(id: string, userId: string, data: UpdateBudgetDto) {
    const existing = await prisma.budget.findFirst({
      where: { id, userId },
    });
    if (!existing) throw { status: 404, message: "Presupuesto no encontrado" };

    try {
      return await prisma.budget.update({
        where: { id },
        data,
        include: { category: { select: { id: true, name: true, type: true } } },
      });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw {
            status: 409,
            message:
              "Ya existe un presupuesto para esta categoría en el mes y año indicados",
          };
        }
      }
      throw e;
    }
  },

  async remove(id: string, userId: string) {
    const existing = await prisma.budget.findFirst({
      where: { id, userId },
    });
    if (!existing) throw { status: 404, message: "Presupuesto no encontrado" };
    await prisma.budget.delete({ where: { id } });
  },

  async getProgress(id: string, userId: string) {
    const budget = await prisma.budget.findFirst({
      where: { id, userId },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!budget) throw { status: 404, message: "Presupuesto no encontrado" };

    const startDate = new Date(budget.year, budget.month - 1, 1);
    const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59, 999);

    const aggregation = await prisma.transaction.aggregate({
      where: {
        userId,
        categoryId: budget.categoryId,
        type: "EXPENSE",
        transactionDate: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    const spent = aggregation._sum.amount?.toNumber() ?? 0;
    const budgeted = budget.amount.toNumber();

    return {
      budgetId: budget.id,
      categoryName: budget.category.name,
      budgeted,
      spent,
      remaining: budgeted - spent,
      percentage: budgeted > 0 ? Math.min(Math.round((spent / budgeted) * 100), 100) : 0,
    };
  },
};
