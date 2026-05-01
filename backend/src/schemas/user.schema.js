import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    username: z.string({ required_error: 'El nombre de usuario es requerido' }).min(3),
    email: z.string({ required_error: 'El email es requerido' }).email('Email inválido'),
    password: z.string({ required_error: 'La contraseña es requerida' }).min(6, 'Mínimo 6 caracteres'),
    status: z.boolean().optional().default(true)
  })
});

export const updateUserSchema = z.object({
  body: z.object({
    username: z.string().min(3).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    status: z.boolean().optional()
  })
});

export const assignInstanceSchema = z.object({
  body: z.object({
    instancia_id: z.number({ required_error: 'El ID de instancia es requerido' }),
    rol_id: z.number({ required_error: 'El ID de rol es requerido' }),
    permisos_personalizados: z.record(z.any()).optional()
  })
});
