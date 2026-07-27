import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { RegisterDto, LoginDto } from "../models/auth.model";
import { successResponse, errorResponse } from "../utils/api-response";

export const authController = {
  /**
   * @openapi
   * /api/auth/register:
   *   post:
   *     tags: [Auth]
   *     summary: Registrar un nuevo usuario
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterDto'
   *     responses:
   *       201:
   *         description: Usuario registrado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Error de validación
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiValidationError'
   *       409:
   *         description: El email ya está registrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body as RegisterDto);
      res.status(201).json(successResponse("Usuario registrado correctamente", result));
    } catch (e: any) {
      res
        .status(e?.status ?? 500)
        .json(errorResponse(e?.message ?? "Error al registrar"));
    }
  },
  /**
   * @openapi
   * /api/auth/login:
   *   post:
   *     tags: [Auth]
   *     summary: Iniciar sesión
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginDto'
   *     responses:
   *       200:
   *         description: Inicio de sesión exitoso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       401:
   *         description: Credenciales inválidas
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body as LoginDto);
      res.json(successResponse("Inicio de sesión exitoso", result));
    } catch (e: any) {
      res
        .status(e?.status ?? 500)
        .json(errorResponse(e?.message ?? "Error al iniciar sesión"));
    }
  },
  /**
   * @openapi
   * /api/auth/me:
   *   get:
   *     tags: [Auth]
   *     summary: Obtener el usuario autenticado
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Usuario autenticado obtenido correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MeResponse'
   *       401:
   *         description: Token requerido o inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async me(req: Request, res: Response): Promise<void> {
    res.json(successResponse("Usuario autenticado obtenido correctamente", req.user));
  },
};
