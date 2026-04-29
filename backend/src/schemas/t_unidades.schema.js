import { z } from 'zod';

const TIPOS_UNIDAD = ['SUPERFICIE', 'PESO', 'CONTEO', 'VOLUMEN', 'OTRO'];

export const createTUnidadSchema = z.object({
    body: z.object({
        nombre: z.string({
            required_error: 'El nombre de la unidad es requerido',
        }).min(2, 'El nombre debe tener al menos 2 caracteres').max(50, 'El nombre debe tener como máximo 50 caracteres'),
        abreviatura: z.string().max(10, 'La abreviatura debe tener como máximo 10 caracteres').optional(),
        tipo: z.enum(TIPOS_UNIDAD, {
            required_error: 'El tipo de unidad es requerido',
            message: `El tipo debe ser uno de: ${TIPOS_UNIDAD.join(', ')}`,
        }).optional(),
    })
});

export const updateTUnidadSchema = z.object({
    body: z.object({
        nombre: z.string().min(2).max(50).optional(),
        abreviatura: z.string().max(10).optional(),
        tipo: z.enum(TIPOS_UNIDAD, {
            message: `El tipo debe ser uno de: ${TIPOS_UNIDAD.join(', ')}`,
        }).optional(),
    })
});
