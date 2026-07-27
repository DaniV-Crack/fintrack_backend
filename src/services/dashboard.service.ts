import prisma from "../config/prisma";
import { DashboardResponse } from "../models/dashboard.model";

export const dashboardService = {
  async getSummary(userId: string, month?: number, year?: number): Promise<DashboardResponse> {
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1;
    const targetYear = year ?? now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const txFilter = {
      userId,
      transactionDate: { gte: startDate, lte: endDate },
    };

    const [balanceGroup, byCategoryResult, budgets] = await Promise.all([
      prisma.transaction.groupBy({
        by: ["type"],
        where: txFilter,
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ["categoryId", "type"],
        where: txFilter,
        _sum: { amount: true },
      }),
      prisma.budget.findMany({
        where: { userId, month: targetMonth, year: targetYear },
        include: { category: { select: { name: true } } },
      }),
    ]);

    const income = balanceGroup.find((g) => g.type === "INCOME")?._sum?.amount?.toNumber() ?? 0;
    const expense = balanceGroup.find((g) => g.type === "EXPENSE")?._sum?.amount?.toNumber() ?? 0;

    const categoryIds = byCategoryResult.map((r) => r.categoryId);
    const categories = categoryIds.length > 0
      ? await prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true },
        })
      : [];
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const byCategory = byCategoryResult.map((r) => ({
      categoryId: r.categoryId,
      categoryName: categoryMap.get(r.categoryId) ?? "Desconocida",
      type: r.type,
      total: r._sum.amount?.toNumber() ?? 0,
    }));

    const budgetAlerts = await Promise.all(
      budgets.map(async (budget) => {
        const spentAgg = await prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            type: "EXPENSE",
            transactionDate: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        });
        const spent = spentAgg._sum.amount?.toNumber() ?? 0;
        const budgeted = budget.amount.toNumber();
        const percentageUsed = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;
        return { budgetId: budget.id, categoryName: budget.category.name, percentageUsed };
      })
    );

    return {
      balance: { income, expense, total: income - expense },
      byCategory,
      budgetAlerts: budgetAlerts.filter((a) => a.percentageUsed >= 80),
    };
  },
};
