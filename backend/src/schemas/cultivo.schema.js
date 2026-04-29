import { z } from 'zod';

export const createCultivoSchema = z.object({
    body: z.object({
        nombre: z.string({
            required_error: 'El nombre del cultivo es requerido',
        }).min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre debe tener como máximo 100 caracteres'),
        nombre_cientifico: z.string().max(100, 'El nombre científico debe tener como máximo 100 caracteres').optional(),
        descripcion: z.string().optional(),
        tipo_cultivo_id: z.number().int().positive('El tipo_cultivo_id debe ser un número positivo').optional(),
    })
});

export const updateCultivoSchema = z.object({
    body: z.object({
        nombre: z.string().min(3).max(100).optional(),
        nombre_cientifico: z.string().max(100).optional(),
        descripcion: z.string().optional(),
        tipo_cultivo_id: z.number().int().positive().optional(),
    })
});
