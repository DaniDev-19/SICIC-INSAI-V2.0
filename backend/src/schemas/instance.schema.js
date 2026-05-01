import { z } from 'zod';

export const createInstanceSchema = z.object({
  body: z.object({
    nombre_mostrable: z.string({ required_error: 'El nombre mostrable es requerido' }).min(3),
    db_name: z.string({ required_error: 'El nombre de la DB es requerido' }).min(3),
    status: z.boolean().optional().default(true)
  })
});

export const updateInstanceSchema = z.object({
  body: z.object({
    nombre_mostrable: z.string().min(3).optional(),
    db_name: z.string().min(3).optional(),
    status: z.boolean().optional()
  })
});
