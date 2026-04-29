import { z } from 'zod';

export const createCaracStatalSchema = z.object({
  body: z.object({
    num_veterinarios_oficiales: z.number().int().min(0).default(0).optional(),
    num_paraveterinarios_oficiales: z.number().int().min(0).default(0).optional(),
    num_administrativos_oficiales: z.number().int().min(0).default(0).optional(),
    num_vehiculos_operativos: z.number().int().min(0).default(0).optional(),
    municipio_id: z.number().int().positive({ message: 'El ID del municipio es requerido' }),
  }),
});

export const updateCaracStatalSchema = z.object({
  body: z.object({
    num_veterinarios_oficiales: z.number().int().min(0).optional(),
    num_paraveterinarios_oficiales: z.number().int().min(0).optional(),
    num_administrativos_oficiales: z.number().int().min(0).optional(),
    num_vehiculos_operativos: z.number().int().min(0).optional(),
    municipio_id: z.number().int().positive().optional(),
  }),
});
