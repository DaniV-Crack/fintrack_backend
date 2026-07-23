import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";
import { CreateUserDto, UpdateUserDto, UserPublic } from "../models/user.model";

// Objeto que define qué campos devolver (excluye passwordHash)
const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} satisfies Prisma.UserSelect;
export const usersService = {
  
    // Retorna todos los usuarios, del más reciente al más antiguo
  async findAll(): Promise<UserPublic[]> {
    return prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: "desc" },
    });
  },
  
  // Busca un usuario por su UUID. Retorna null si no existe.
  async findById(id: string): Promise<UserPublic | null> {
    return prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
  },
  
  // Crea un usuario. NOTA: password en texto plano solo para Clase 2.
  // En Clase 3 lo reemplazaremos por bcrypt.hash(password, 10).
  async create(data: CreateUserDto): Promise<UserPublic> {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.password, // TODO Clase 3: usar bcrypt
      },
      select: USER_SELECT,
    });
  },
  
  // Actualiza solo los campos que se envíen (name y/o email)
  async update(id: string, data: UpdateUserDto): Promise<UserPublic> {
    return prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });
  },
  
  // Elimina el usuario. Prisma lanza P2025 si no existe.
  async remove(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  },
  
  // Verifica si un email ya está registrado (para evitar duplicados)
  async existsByEmail(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user !== null;
  },
};
