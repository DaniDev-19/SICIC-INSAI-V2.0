import { z } from 'zod';

export const createEnfermedadSchema = z.object({
    body: z.object({
        nombre: z.string({
            required_error: 'El nombre de la enfermedad es requerido',
        }).min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre debe tener como máximo 100 caracteres'),
        nombre_cientifico: z.string().max(100, 'El nombre científico debe tener como máximo 100 caracteres').optional(),
        zoonatica: z.string().max(100).optional(),
        descripcion: z.string().optional(),
        tipo_enfermedad_id: z.number().int().positive('El tipo_enfermedad_id debe ser un número positivo').optional(),
    })
});

export const updateEnfermedadSchema = z.object({
    body: z.object({
        nombre: z.string().min(3).max(100).optional(),
        nombre_cientifico: z.string().max(100).optional(),
        zoonatica: z.string().max(100).optional(),
        descripcion: z.string().optional(),
        tipo_enfermedad_id: z.number().int().positive().optional(),
    })
});
