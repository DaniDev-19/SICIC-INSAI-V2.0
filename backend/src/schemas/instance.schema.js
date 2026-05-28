import { z } from 'zod';

const dbNameRegex = /^[a-z][a-z0-9_]*$/;

export const createInstanceSchema = z.object({
  body: z.object({
    nombre_mostrable: z.string({ required_error: 'El nombre mostrable es requerido' }).min(3),
    db_name: z
      .string({ required_error: 'El nombre de la DB es requerido' })
      .min(3)
      .regex(dbNameRegex, 'Use solo minúsculas, números y guión bajo (ej: db_insai_operativa)'),
    status: z.boolean().optional().default(true),
  }),
});

export const updateInstanceSchema = z.object({
  body: z.object({
    nombre_mostrable: z.string().min(3).optional(),
    db_name: z.string().min(3).regex(dbNameRegex).optional(),
    status: z.boolean().optional(),
  }),
});

export const updateInstanceStatusSchema = z.object({
  body: z.object({
    status: z.boolean(),
  }),
});
