import { Prisma, TransactionType } from "@prisma/client";
import prisma from "../config/prisma";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../models/category.model";

export const categoryService = {
  async findAll(userId: string, type?: TransactionType) {
    return prisma.category.findMany({
      where: { userId, ...(type && { type }) },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string, userId: string) {
    return prisma.category.findFirst({
      where: { id, userId },
    });
  },

  async create(data: CreateCategoryDto) {
    try {
      return await prisma.category.create({ data });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw {
            status: 409,
            message: "Ya existe una categoría con ese nombre y tipo",
          };
        }
      }
      throw e;
    }
  },

  async update(id: string, userId: string, data: UpdateCategoryDto) {
    const existing = await prisma.category.findFirst({
      where: { id, userId },
    });
    if (!existing) throw { status: 404, message: "Categoría no encontrada" };
    if (data.type && data.type !== existing.type) {
      const txCount = await prisma.transaction.count({
        where: { categoryId: id },
      });
      if (txCount > 0) {
        throw {
          status: 409,
          message:
            "No se puede cambiar el tipo de una categoría que tiene transacciones asociadas",
        };
      }
    }
    try {
      return await prisma.category.update({
        where: { id },
        data,
      });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw {
            status: 409,
            message: "Ya existe una categoría con ese nombre y tipo",
          };
        }
        if (e.code === "P2025") {
          throw { status: 404, message: "Categoría no encontrada" };
        }
      }
      throw e;
    }
  },

  async remove(id: string, userId: string) {
    const existing = await prisma.category.findFirst({
      where: { id, userId },
    });
    if (!existing) throw { status: 404, message: "Categoría no encontrada" };
    const txCount = await prisma.transaction.count({
      where: { categoryId: id },
    });
    if (txCount > 0) {
      throw {
        status: 409,
        message:
          "No se puede eliminar una categoría que tiene transacciones asociadas",
      };
    }
    await prisma.category.delete({ where: { id } });
  },
};
