import { z } from 'zod';
import { UserRole, FacultyDivision } from './enums.js';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2),
  role: z.nativeEnum(UserRole),
  faculty: z.nativeEnum(FacultyDivision),
  department: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  skills: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserDto = z.infer<typeof UserSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginRequestDto = z.infer<typeof LoginRequestSchema>;

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.nativeEnum(UserRole).default(UserRole.STUDENT),
  faculty: z.nativeEnum(FacultyDivision).default(FacultyDivision.FIT),
  department: z.string().optional(),
});

export type RegisterRequestDto = z.infer<typeof RegisterRequestSchema>;

export const AuthResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type AuthResponseDto = z.infer<typeof AuthResponseSchema>;
