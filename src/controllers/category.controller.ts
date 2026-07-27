import { Request, Response } from "express";
import { categoryService } from "../services/category.service";
import { CreateCategoryDto, UpdateCategoryDto } from "../models/category.model";
import { TransactionType } from "@prisma/client";
import { successResponse, errorResponse } from "../utils/api-response";

export const categoryController = {
  /**
   * @openapi
   * /api/categories:
   *   get:
   *     tags: [Categorías]
   *     summary: Listar categorías del usuario autenticado
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [INCOME, EXPENSE]
   *         description: Filtrar por tipo de transacción
   *     responses:
   *       200:
   *         description: Lista de categorías
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CategoryListResponse'
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const type = req.query.type as TransactionType | undefined;
      const categories = await categoryService.findAll(userId, type);
      res.json(successResponse("Categorías obtenidas correctamente", categories));
    } catch (error) {
      res.status(500).json(errorResponse("Error al obtener categorías"));
    }
  },

  /**
   * @openapi
   * /api/categories/{id}:
   *   get:
   *     tags: [Categorías]
   *     summary: Obtener una categoría por ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Categoría obtenida correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CategoryResponse'
   *       404:
   *         description: Categoría no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const category = await categoryService.findById(
        req.params.id as string,
        userId
      );
      if (!category) {
        res.status(404).json(errorResponse("Categoría no encontrada"));
        return;
      }
      res.json(successResponse("Categoría obtenida correctamente", category));
    } catch (error) {
      res.status(500).json(errorResponse("Error al obtener la categoría"));
    }
  },

  /**
   * @openapi
   * /api/categories:
   *   post:
   *     tags: [Categorías]
   *     summary: Crear una nueva categoría
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateCategoryDto'
   *     responses:
   *       201:
   *         description: Categoría creada correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CategoryResponse'
   *       409:
   *         description: Ya existe una categoría con ese nombre y tipo
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { name, type } = req.body as CreateCategoryDto;
      const category = await categoryService.create({
        userId,
        name,
        type,
      });
      res.status(201).json(successResponse("Categoría creada correctamente", category));
    } catch (e: any) {
      if (e?.status) {
        res.status(e.status).json(errorResponse(e.message));
        return;
      }
      res.status(500).json(errorResponse("Error al crear la categoría"));
    }
  },

  /**
   * @openapi
   * /api/categories/{id}:
   *   put:
   *     tags: [Categorías]
   *     summary: Actualizar una categoría
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateCategoryDto'
   *     responses:
   *       200:
   *         description: Categoría actualizada correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CategoryResponse'
   *       404:
   *         description: Categoría no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *       409:
   *         description: Conflicto (tipo con transacciones o duplicado)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const category = await categoryService.update(
        req.params.id as string,
        userId,
        req.body as UpdateCategoryDto
      );
      res.json(successResponse("Categoría actualizada correctamente", category));
    } catch (e: any) {
      if (e?.status) {
        res.status(e.status).json(errorResponse(e.message));
        return;
      }
      res.status(500).json(errorResponse("Error al actualizar la categoría"));
    }
  },

  /**
   * @openapi
   * /api/categories/{id}:
   *   delete:
   *     tags: [Categorías]
   *     summary: Eliminar una categoría
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Categoría eliminada correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DeleteResponse'
   *       404:
   *         description: Categoría no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *       409:
   *         description: Tiene transacciones asociadas
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async remove(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      await categoryService.remove(req.params.id as string, userId);
      res.json(successResponse("Categoría eliminada correctamente", null));
    } catch (e: any) {
      if (e?.status) {
        res.status(e.status).json(errorResponse(e.message));
        return;
      }
      res.status(500).json(errorResponse("Error al eliminar la categoría"));
    }
  },
};
