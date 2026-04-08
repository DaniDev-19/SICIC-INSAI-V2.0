import { z } from 'zod';

export const createRoleSchema = z.object({
  nombre: z.string({
    required_error: 'El nombre del rol es requerido',
  }).min(3, 'El nombre debe tener al menos 3 caracteres').max(50),
  descripcion: z.string().optional(),
  permisos: z.record(z.any()).optional().default({}),
});

export const updateRoleSchema = z.object({
  nombre: z.string().min(3).max(50).optional(),
  descripcion: z.string().optional(),
  permisos: z.record(z.any()).optional(),
});
