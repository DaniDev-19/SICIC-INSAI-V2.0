import { z } from 'zod';

const cultivoSchema = z.object({
  cultivo_id: z.number().int().positive(),
  superficie: z.number().optional(),
  superficie_unidad_id: z.number().int().positive().optional(),
  cantidad: z.number().optional(),
  cantidad_unidad_id: z.number().int().positive().optional(),
});

const animalSchema = z.object({
  animal_id: z.number().int().positive(),
  cantidad: z.number().optional(),
  cantidad_unidad_id: z.number().int().positive().optional(),
  observaciones: z.string().optional(),
});

const ubicacionSchema = z.object({
  sector_id: z.number().int().positive().optional(),
  google_maps_url: z.string().url().optional().or(z.literal('')),
});

const hierroSchema = z.object({
  num_reg_hierro: z.string().max(100).optional(),
  num_reg_ganadero: z.string().max(100).optional(),
});

export const createPropiedadesSchema = z.object({
  body: z.object({
    codigo_insai: z.string().max(50).optional(),
    nombre: z.string({ required_error: 'El nombre es requerido' }).min(3).max(255),
    rif: z.string().max(50).optional(),
    punto_referencia: z.string().optional(),
    hectareas_totales: z.number().optional(),
    status: z.string().max(100).default('ACTIVA').optional(),
    tipo_propiedad_id: z.number().int().positive().optional(),
    due_o_id: z.number().int().positive({ message: 'El dueño (cliente) es requerido' }),

    hierro: hierroSchema.optional(),
    ubicacion: ubicacionSchema.optional(),
    cultivos: z.array(cultivoSchema).optional(),
    animales: z.array(animalSchema).optional(),
  }),
});

export const updatePropiedadesSchema = z.object({
  body: z.object({
    codigo_insai: z.string().max(50).optional(),
    nombre: z.string().min(3).max(255).optional(),
    rif: z.string().max(50).optional(),
    punto_referencia: z.string().optional(),
    hectareas_totales: z.number().optional(),
    status: z.string().max(100).optional(),
    tipo_propiedad_id: z.number().int().positive().optional(),
    due_o_id: z.number().int().positive().optional(),

    hierro: hierroSchema.optional(),
    ubicacion: ubicacionSchema.optional(),
    cultivos: z.array(cultivoSchema).optional(),
    animales: z.array(animalSchema).optional(),
  }),
});
