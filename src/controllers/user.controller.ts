import { Request, Response } from "express";
import { usersService } from "../services/user.service";
import { CreateUserDto, UpdateUserDto } from "../models/user.model";
import { successResponse, errorResponse } from "../utils/api-response";

export const usersController = {

  /**
   * @openapi
   * /api/users:
   *   get:
   *     tags: [Usuarios]
   *     summary: Listar todos los usuarios
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de usuarios
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserListResponse'
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await usersService.findAll();
      res.json(successResponse("Usuarios obtenidos correctamente", users));
    } catch (error) {
      res.status(500).json(errorResponse("Error al obtener usuarios"));
    }
  },

  /**
   * @openapi
   * /api/users/{id}:
   *   get:
   *     tags: [Usuarios]
   *     summary: Obtener un usuario por ID
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
   *         description: Usuario obtenido correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponse'
   *       404:
   *         description: Usuario no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const user = await usersService.findById(req.params.id as string);
      if (!user) {
        res.status(404).json(errorResponse("Usuario no encontrado"));
        return;
      }
      res.json(successResponse("Usuario obtenido correctamente", user));
    } catch (error) {
      res.status(500).json(errorResponse("Error al obtener el usuario"));
    }
  },

  /**
   * @openapi
   * /api/users:
   *   post:
   *     tags: [Usuarios]
   *     summary: Crear un nuevo usuario
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateUserDto'
   *     responses:
   *       201:
   *         description: Usuario creado correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponse'
   *       409:
   *         description: El email ya está registrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body as CreateUserDto;
      const exists = await usersService.existsByEmail(email);
      if (exists) {
        res.status(409).json(errorResponse("El email ya está registrado"));
        return;
      }
      const user = await usersService.create({ name, email, password });
      res.status(201).json(successResponse("Usuario creado correctamente", user));
    } catch (error) {
      res.status(500).json(errorResponse("Error al crear el usuario"));
    }
  },

  /**
   * @openapi
   * /api/users/{id}:
   *   put:
   *     tags: [Usuarios]
   *     summary: Actualizar un usuario
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
   *             $ref: '#/components/schemas/UpdateUserDto'
   *     responses:
   *       200:
   *         description: Usuario actualizado correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponse'
   *       403:
   *         description: No tienes permiso para actualizar este usuario
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *       404:
   *         description: Usuario no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      if (req.params.id !== userId) {
        res.status(403).json(errorResponse("No tienes permiso para actualizar este usuario"));
        return;
      }
      const { name, email } = req.body as UpdateUserDto;
      const user = await usersService.update(userId, { name, email });
      res.json(successResponse("Usuario actualizado correctamente", user));
    } catch (error: any) {
      if (error?.code === "P2025") {
        res.status(404).json(errorResponse("Usuario no encontrado"));
        return;
      }
      res.status(500).json(errorResponse("Error al actualizar el usuario"));
    }
  },

  /**
   * @openapi
   * /api/users/{id}:
   *   delete:
   *     tags: [Usuarios]
   *     summary: Eliminar un usuario
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
   *         description: Usuario eliminado correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DeleteResponse'
   *       403:
   *         description: No tienes permiso para eliminar este usuario
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *       404:
   *         description: Usuario no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   */
  async remove(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      if (req.params.id !== userId) {
        res.status(403).json(errorResponse("No tienes permiso para eliminar este usuario"));
        return;
      }
      await usersService.remove(userId);
      res.json(successResponse("Usuario eliminado correctamente", null));
    } catch (error: any) {
      if (error?.code === "P2025") {
        res.status(404).json(errorResponse("Usuario no encontrado"));
        return;
      }
      res.status(500).json(errorResponse("Error al eliminar el usuario"));
    }
  },
};
