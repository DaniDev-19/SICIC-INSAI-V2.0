import { z } from 'zod';

export const createSectorSchema = z.object({
    body: z.object({
        codigo: z.string({
            required_error: 'El código del sector es requerido',
        }).min(1, 'El código es requerido').max(50, 'El código debe tener como máximo 50 caracteres'),
        nombre: z.string({
            required_error: 'El nombre del sector es requerido',
        }).min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre debe tener como máximo 100 caracteres'),
        parroquia_id: z.number({
            required_error: 'La parroquia es requerida',
        }).int().positive('El parroquia_id debe ser un número positivo'),
    })
});

export const updateSectorSchema = z.object({
    body: z.object({
        codigo: z.string().min(1).max(50).optional(),
        nombre: z.string().min(3).max(100).optional(),
        parroquia_id: z.number().int().positive().optional(),
    })
});
