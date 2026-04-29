import { z } from 'zod';

export const createAnimalSchema = z.object({
    body: z.object({
        nombre: z.string({
            required_error: 'El nombre del animal es requerido',
        }).min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre debe tener como máximo 100 caracteres'),
        nombre_cientifico: z.string().max(100, 'El nombre científico debe tener como máximo 100 caracteres').optional(),
        dieta: z.string().max(100).optional(),
        esperanza_vida: z.string().max(100).optional(),
        habitat_principal: z.string().max(100).optional(),
        peso_promedio_kg: z.number().min(0, 'El peso no puede ser negativo').optional(),
        longitud_promedio_mt: z.number().min(0, 'La longitud no puede ser negativa').optional(),
        descripcion: z.string().optional(),
        tipo_animal_id: z.number().int().positive('El tipo_animal_id debe ser un número positivo').optional(),
    })
});

export const updateAnimalSchema = z.object({
    body: z.object({
        nombre: z.string().min(3).max(100).optional(),
        nombre_cientifico: z.string().max(100).optional(),
        dieta: z.string().max(100).optional(),
        esperanza_vida: z.string().max(100).optional(),
        habitat_principal: z.string().max(100).optional(),
        peso_promedio_kg: z.number().min(0).optional(),
        longitud_promedio_mt: z.number().min(0).optional(),
        descripcion: z.string().optional(),
        tipo_animal_id: z.number().int().positive().optional(),
    })
});
