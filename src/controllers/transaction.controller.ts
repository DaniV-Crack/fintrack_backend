import { Request, Response } from "express";
import { transactionService } from "../services/transaction.service";
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from "../models/transaction.model";
import { TransactionType } from "@prisma/client";
import { successResponse, errorResponse } from "../utils/api-response";

export const transactionController = {
  /**
   * @openapi
   * /api/transactions:
   *   get:
   *     tags: [Transacciones]
   *     summary: Listar transacciones del usuario autenticado
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: categoryId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filtrar por categoría
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [INCOME, EXPENSE]
   *         description: Filtrar por tipo
   *       - in: query
   *         name: dateFrom
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Fecha inicial (ISO 8601)
   *       - in: query
   *         name: dateTo
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Fecha final (ISO 8601)
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número de página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Elementos por página
   *     responses:
   *       200:
   *         description: Lista paginada de transacciones
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TransactionListResponse'
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { categoryId, type, dateFrom, dateTo, page, limit } = req.query;
      const result = await transactionService.findAll({
        userId,
        categoryId: categoryId as string | undefined,
        type: type as TransactionType | undefined,
        dateFrom: dateFrom as string | undefined,
        dateTo: dateTo as string | undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      res.json(successResponse("Transacciones obtenidas correctamente", {
        transactions: result.data,
        pagination: result.pagination,
      }));
    } catch (error) {
      res.status(500).json(errorResponse("Error al obtener transacciones"));
    }
  },

  /**
   * @openapi
   * /api/transactions/summary:
   *   get:
   *     tags: [Transacciones]
   *     summary: Resumen agregado de ingresos/gastos
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: month
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 12
   *         description: Mes (1-12). Por defecto el actual.
   *       - in: query
   *         name: year
   *         schema:
   *           type: integer
   *         description: Año. Por defecto el actual.
   *     responses:
   *       200:
   *         description: Resumen de ingresos, gastos y balance
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TransactionSummaryResponse'
   */
  async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const month = req.query.month
        ? parseInt(req.query.month as string, 10)
        : undefined;
      const year = req.query.year
        ? parseInt(req.query.year as string, 10)
        : undefined;
      const dateFrom = req.query.dateFrom as string | undefined;
      const dateTo = req.query.dateTo as string | undefined;
      const summary = await transactionService.getSummary(userId, month, year, dateFrom, dateTo);
      res.json(successResponse("Resumen obtenido correctamente", summary));
    } catch (error) {
      res.status(500).json(errorResponse("Error al obtener resumen de transacciones"));
    }
  },

  /**
   * @openapi
   * /api/transactions/{id}:
   *   get:
   *     tags: [Transacciones]
   *     summary: Obtener una transacción por ID
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
   *         description: Transacción obtenida correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TransactionResponse'
   *       404:
   *         description: Transacción no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const tx = await transactionService.findById(req.params.id as string, userId);
      if (!tx) {
        res.status(404).json(errorResponse("Transacción no encontrada"));
        return;
      }
      res.json(successResponse("Transacción obtenida correctamente", tx));
    } catch (error) {
      res.status(500).json(errorResponse("Error al obtener la transacción"));
    }
  },

  /**
   * @openapi
   * /api/transactions:
   *   post:
   *     tags: [Transacciones]
   *     summary: Crear una nueva transacción
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateTransactionDto'
   *     responses:
   *       201:
   *         description: Transacción creada correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TransactionResponse'
   *       400:
   *         description: Tipo no coincide con la categoría
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *       404:
   *         description: Categoría no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const dto = req.body as CreateTransactionDto;
      const tx = await transactionService.create({
        ...dto,
        userId,
        transactionDate: new Date(dto.transactionDate),
      });
      res.status(201).json(successResponse("Transacción creada correctamente", tx));
    } catch (e: any) {
      if (e?.status) {
        res.status(e.status).json(errorResponse(e.message));
        return;
      }
      res.status(500).json(errorResponse("Error al crear la transacción"));
    }
  },

  /**
   * @openapi
   * /api/transactions/{id}:
   *   put:
   *     tags: [Transacciones]
   *     summary: Actualizar una transacción
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
   *             $ref: '#/components/schemas/UpdateTransactionDto'
   *     responses:
   *       200:
   *         description: Transacción actualizada correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TransactionResponse'
   *       404:
   *         description: Transacción no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const dto = req.body as UpdateTransactionDto;
      const tx = await transactionService.update(req.params.id as string, userId, {
        ...dto,
        transactionDate: dto.transactionDate
          ? new Date(dto.transactionDate)
          : undefined,
      });
      res.json(successResponse("Transacción actualizada correctamente", tx));
    } catch (e: any) {
      if (e?.status) {
        res.status(e.status).json(errorResponse(e.message));
        return;
      }
      res.status(500).json(errorResponse("Error al actualizar la transacción"));
    }
  },

  /**
   * @openapi
   * /api/transactions/{id}:
   *   delete:
   *     tags: [Transacciones]
   *     summary: Eliminar una transacción
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
   *         description: Transacción eliminada correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DeleteResponse'
   *       404:
   *         description: Transacción no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async remove(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      await transactionService.remove(req.params.id as string, userId);
      res.json(successResponse("Transacción eliminada correctamente", null));
    } catch (e: any) {
      if (e?.status) {
        res.status(e.status).json(errorResponse(e.message));
        return;
      }
      res.status(500).json(errorResponse("Error al eliminar la transacción"));
    }
  },
};
