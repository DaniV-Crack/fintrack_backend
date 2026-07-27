import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";
import { successResponse, errorResponse } from "../utils/api-response";

export const dashboardController = {
  /**
   * @openapi
   * /api/dashboard:
   *   get:
   *     tags: [Dashboard]
   *     summary: Resumen mensual del dashboard
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
   *         description: Resumen completo del dashboard
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DashboardResponse'
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
      const summary = await dashboardService.getSummary(userId, month, year);
      res.json(successResponse("Dashboard obtenido correctamente", summary));
    } catch (error) {
      res.status(500).json(errorResponse("Error al obtener el dashboard"));
    }
  },
};
