import { z } from 'zod';

export const createCInsumosSchema = z.object({
    body: z.object({
        nombre: z.string({
            required_error: 'El nombre de la categoria de insumos es requerido',
        }).min(3, 'El nombre debe tener al menos 3 caracteres').max(50, 'El nombre debe tener como máximo 50 caracteres')
    })
});

export const updateCInsumosSchema = z.object({
    body: z.object({
        nombre: z.string().min(3).max(50).optional()
    })
});