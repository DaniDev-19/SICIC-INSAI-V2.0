import { z } from 'zod';

export const createContratoSchema = z.object({
    body: z.object({
        nombre: z.string({
            required_error: 'El nombre del contrato es requerido',
        }).min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre debe tener como máximo 100 caracteres'),
    })
});

export const updateContratoSchema = z.object({
    body: z.object({
        nombre: z.string().min(3).max(100).optional(),
    })
});
