import { z } from 'zod';

export const createOficinaSchema = z.object({
    body: z.object({
        nombre: z.string({
            required_error: 'El nombre de la oficina es requerido',
        }).min(3, 'El nombre debe tener al menos 3 caracteres').max(150, 'El nombre debe tener como máximo 150 caracteres'),
        ubicacion_gms: z.string().max(255, 'La ubicación GMS debe tener como máximo 255 caracteres').optional(),
        es_centro_validacion: z.boolean().optional(),
        direccion: z.string().optional(),
    })
});

export const updateOficinaSchema = z.object({
    body: z.object({
        nombre: z.string().min(3).max(150).optional(),
        ubicacion_gms: z.string().max(255).optional(),
        es_centro_validacion: z.boolean().optional(),
        direccion: z.string().optional(),
    })
});
