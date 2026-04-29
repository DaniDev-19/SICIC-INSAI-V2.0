import { z } from 'zod';

export const createInsumosSchema = z.object({
  body: z.object({
    codigo: z.string().max(100).optional(),
    nombre: z.string({
      required_error: 'El nombre es requerido',
    }).min(3).max(150),
    marca: z.string().max(100).optional(),
    descripcion: z.string().optional(),
    categoria_id: z.number().int().positive().optional(),
    unidad_medida_id: z.number().int().positive().optional(),
  }),
});

export const updateInsumosSchema = z.object({
  body: z.object({
    codigo: z.string().max(100).optional(),
    nombre: z.string().min(3).max(150).optional(),
    marca: z.string().max(100).optional(),
    descripcion: z.string().optional(),
    categoria_id: z.number().int().positive().optional(),
    unidad_medida_id: z.number().int().positive().optional(),
  }),
});
