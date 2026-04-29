import { z } from 'zod';

export const createEstadoSchema = z.object({
    body: z.object({
        codigo: z.string({
            required_error: 'El código del estado es requerido',
        }).min(1, 'El código es requerido').max(50, 'El código debe tener como máximo 50 caracteres'),
        nombre: z.string({
            required_error: 'El nombre del estado es requerido',
        }).min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre debe tener como máximo 100 caracteres'),
        area_km2: z.number().min(0, 'El área no puede ser negativa').optional(),
    })
});

export const updateEstadoSchema = z.object({
    body: z.object({
        codigo: z.string().min(1).max(50).optional(),
        nombre: z.string().min(3).max(100).optional(),
        area_km2: z.number().min(0).optional(),
    })
});
