import { User } from '@prisma/client';

// Tipo público: lo que la API devuelve (sin la contraseña)
export type UserPublic = Omit<User, 'passwordHash'>;

// DTO = Data Transfer Object: define qué datos recibe el endpoint

export interface CreateUserDto {
 name: string;
 email: string;
 password: string; // En Clase 3 hashearemos esto con bcrypt
}

export interface UpdateUserDto {
 name?: string;
 email?: string;
}