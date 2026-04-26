import { z } from 'zod';

export const createTPropiedadSchema = z.object({
    body: z.object({
        nombre: z.string({
            required_error: 'El nombre de la profesión es requerido',
        }).min(3, 'El nombre debe tener al menos 3 caracteres').max(50, 'El nombre debe')
    })
});

export const updateTPropiedadSchema = z.object({
    body: z.object({
        nombre: z.string().min(3).max(50).optional()
    })
});