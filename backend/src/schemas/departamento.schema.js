import { z } from 'zod';

export const createDepartamentoSchema = z.object({
    body: z.object({
        nombre: z.string({
            required_error: 'El nombre del departamento es requerido',
        }).min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre debe tener como máximo 100 caracteres'),
    })
});

export const updateDepartamentoSchema = z.object({
    body: z.object({
        nombre: z.string().min(3).max(100).optional(),
    })
});
