import { z } from 'zod';

export const createFinalidadSchema = z.object({
    body: z.object({
        nombre: z.string({
            required_error: 'El nombre de la finalidad es requerido',
        }).min(3, 'El nombre debe tener al menos 3 caracteres').max(150, 'El nombre debe tener como máximo 150 caracteres'),
    })
});

export const updateFinalidadSchema = z.object({
    body: z.object({
        nombre: z.string().min(3).max(150).optional(),
    })
});
