import { Router, Request, Response } from "express";
import pool from "../config/database";
import { successResponse, errorResponse } from "../utils/api-response";

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Verificar estado del servidor y conexión a BD
 *     responses:
 *       200:
 *         description: Servidor y BD funcionando
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       500:
 *         description: Error de conexión a BD
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT NOW() as timestamp, version() as pg_version",
    );
    res.json(successResponse("FinTrack API funcionando correctamente", {
      status: "ok",
      server: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      },
      database: {
        status: "connected",
        queryTimestamp: result.rows[0].timestamp,
      },
    }));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json(errorResponse("Error al conectar con la base de datos"));
  }
});

export default router;
