import { Request, Response } from "express";
import { budgetService } from "../services/budget.service";
import { CreateBudgetDto, UpdateBudgetDto } from "../models/budget.model";
import { successResponse, errorResponse } from "../utils/api-response";

export const budgetController = {
  /**
   * @openapi
   * /api/budgets:
   *   get:
   *     tags: [Presupuestos]
   *     summary: Listar presupuestos del usuario autenticado
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: month
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 12
   *         description: Filtrar por mes
   *       - in: query
   *         name: year
   *         schema:
   *           type: integer
   *         description: Filtrar por año
   *     responses:
   *       200:
   *         description: Lista de presupuestos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BudgetListResponse'
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const month = req.query.month
        ? parseInt(req.query.month as string, 10)
        : undefined;
      const year = req.query.year
        ? parseInt(req.query.year as string, 10)
        : undefined;
      const budgets = await budgetService.findAll(userId, month, year);
      res.json(successResponse("Presupuestos obtenidos correctamente", budgets));
    } catch (error) {
      res.status(500).json(errorResponse("Error al obtener presupuestos"));
    }
  },

  /**
   * @openapi
   * /api/budgets/{id}:
   *   get:
   *     tags: [Presupuestos]
   *     summary: Obtener un presupuesto por ID
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
   *         description: Presupuesto obtenido correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BudgetResponse'
   *       404:
   *         description: Presupuesto no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const budget = await budgetService.findById(req.params.id as string, userId);
      if (!budget) {
        res.status(404).json(errorResponse("Presupuesto no encontrado"));
        return;
      }
      res.json(successResponse("Presupuesto obtenido correctamente", budget));
    } catch (error) {
      res.status(500).json(errorResponse("Error al obtener el presupuesto"));
    }
  },

  /**
   * @openapi
   * /api/budgets:
   *   post:
   *     tags: [Presupuestos]
   *     summary: Crear un nuevo presupuesto
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateBudgetDto'
   *     responses:
   *       201:
   *         description: Presupuesto creado correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BudgetResponse'
   *       404:
   *         description: Categoría no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *       409:
   *         description: Ya existe para esa categoría/mes/año
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const dto = req.body as CreateBudgetDto;
      const budget = await budgetService.create({ ...dto, userId });
      res.status(201).json(successResponse("Presupuesto creado correctamente", budget));
    } catch (e: any) {
      if (e?.status) {
        res.status(e.status).json(errorResponse(e.message));
        return;
      }
      res.status(500).json(errorResponse("Error al crear el presupuesto"));
    }
  },

  /**
   * @openapi
   * /api/budgets/{id}:
   *   put:
   *     tags: [Presupuestos]
   *     summary: Actualizar un presupuesto
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
   *             $ref: '#/components/schemas/UpdateBudgetDto'
   *     responses:
   *       200:
   *         description: Presupuesto actualizado correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BudgetResponse'
   *       404:
   *         description: Presupuesto no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const budget = await budgetService.update(
        req.params.id as string,
        userId,
        req.body as UpdateBudgetDto
      );
      res.json(successResponse("Presupuesto actualizado correctamente", budget));
    } catch (e: any) {
      if (e?.status) {
        res.status(e.status).json(errorResponse(e.message));
        return;
      }
      res.status(500).json(errorResponse("Error al actualizar el presupuesto"));
    }
  },

  /**
   * @openapi
   * /api/budgets/{id}:
   *   delete:
   *     tags: [Presupuestos]
   *     summary: Eliminar un presupuesto
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
   *         description: Presupuesto eliminado correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DeleteResponse'
   *       404:
   *         description: Presupuesto no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async remove(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      await budgetService.remove(req.params.id as string, userId);
      res.json(successResponse("Presupuesto eliminado correctamente", null));
    } catch (e: any) {
      if (e?.status) {
        res.status(e.status).json(errorResponse(e.message));
        return;
      }
      res.status(500).json(errorResponse("Error al eliminar el presupuesto"));
    }
  },

  /**
   * @openapi
   * /api/budgets/{id}/progress:
   *   get:
   *     tags: [Presupuestos]
   *     summary: Obtener progreso de gasto vs presupuesto
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
   *         description: Progreso del presupuesto
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BudgetProgressResponse'
   *       404:
   *         description: Presupuesto no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async getProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const progress = await budgetService.getProgress(req.params.id as string, userId);
      res.json(successResponse("Progreso del presupuesto obtenido correctamente", progress));
    } catch (e: any) {
      if (e?.status) {
        res.status(e.status).json(errorResponse(e.message));
        return;
      }
      res.status(500).json(errorResponse("Error al obtener el progreso"));
    }
  },
};
