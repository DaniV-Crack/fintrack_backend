import { Request, Response } from "express";
import { usersService } from "../services/user.service";
import { CreateUserDto, UpdateUserDto } from "../models/user.model";

export const usersController = {
  
  /**
   * @openapi
   * /api/users:
   *   get:
   *     tags: [Usuarios]
   *     summary: Listar todos los usuarios
   *     responses:
   *       200:
   *         description: Lista de usuarios
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/User'
   *                 count:
   *                   type: integer
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await usersService.findAll();
      res.json({ data: users, count: users.length });
    } catch (error) {
      res.status(500).json({ error: "Error al obtener usuarios" });
    }
  },
  
  /**
   * @openapi
   * /api/users/{id}:
   *   get:
   *     tags: [Usuarios]
   *     summary: Obtener un usuario por ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID del usuario
   *     responses:
   *       200:
   *         description: Datos del usuario
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       404:
   *         description: Usuario no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const user = await usersService.findById(req.params.id as string);
      if (!user) {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }
      res.json({ data: user });
    } catch (error) {
      res.status(500).json({ error: "Error al obtener el usuario" });
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
   *         description: Usuario creado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       400:
   *         description: Campos requeridos faltantes
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: El email ya está registrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body as CreateUserDto;
      // Validación básica de campos requeridos
      if (!name || !email || !password) {
        res
          .status(400)
          .json({ error: "name, email y password son requeridos" });
        return;
      }
      // Verificar que el email no exista ya
      const exists = await usersService.existsByEmail(email);
      if (exists) {
        res.status(409).json({ error: "El email ya está registrado" });
        return;
      }
      const user = await usersService.create({ name, email, password });
      res.status(201).json({ data: user });
    } catch (error) {
      res.status(500).json({ error: "Error al crear el usuario" });
    }
  },
  
  /**
   * @openapi
   * /api/users/{id}:
   *   put:
   *     tags: [Usuarios]
   *     summary: Actualizar un usuario
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID del usuario
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateUserDto'
   *     responses:
   *       200:
   *         description: Usuario actualizado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       404:
   *         description: Usuario no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { name, email } = req.body as UpdateUserDto;
      const user = await usersService.update(req.params.id as string, { name, email });
      res.json({ data: user });
    } catch (error: any) {
      if (error?.code === "P2025") {
        // P2025 = Prisma "Record not found"
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }
      res.status(500).json({ error: "Error al actualizar el usuario" });
    }
  },
  
  /**
   * @openapi
   * /api/users/{id}:
   *   delete:
   *     tags: [Usuarios]
   *     summary: Eliminar un usuario
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID del usuario
   *     responses:
   *       204:
   *         description: Usuario eliminado (sin contenido)
   *       404:
   *         description: Usuario no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async remove(req: Request, res: Response): Promise<void> {
    try {
      await usersService.remove(req.params.id as string);
      res.status(204).send(); // 204 = No Content (éxito sin body)
    } catch (error: any) {
      if (error?.code === "P2025") {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }
      res.status(500).json({ error: "Error al eliminar el usuario" });
    }
  },
};
