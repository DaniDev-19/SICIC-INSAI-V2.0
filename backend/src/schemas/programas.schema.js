import { z } from 'zod';

export const createProgramasSchema = z.object({
  body: z.object({
    nombre: z.string({
      required_error: 'El nombre es requerido',
    }).min(3).max(100),
    descripcion: z.string().optional(),
    tipo_programa_id: z.number().int().positive().optional(),
    plagas_ids: z.array(z.number().int().positive()).optional(),
    cultivos_ids: z.array(z.number().int().positive()).optional(),
    animales_ids: z.array(z.number().int().positive()).optional(),
    enfermedades_ids: z.array(z.number().int().positive()).optional(),
  }),
});

export const updateProgramasSchema = z.object({
  body: z.object({
    nombre: z.string().min(3).max(100).optional(),
    descripcion: z.string().optional(),
    tipo_programa_id: z.number().int().positive().optional(),
    plagas_ids: z.array(z.number().int().positive()).optional(),
    cultivos_ids: z.array(z.number().int().positive()).optional(),
    animales_ids: z.array(z.number().int().positive()).optional(),
    enfermedades_ids: z.array(z.number().int().positive()).optional(),
  }),
});
