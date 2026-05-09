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
  sector_id: z.coerce.number().int().positive().optional(),
  google_maps_url: z.string().max(1000).optional().or(z.literal('')),
});

const hierroSchema = z.object({
  num_reg_hierro: z.string().max(100).optional(),
  num_reg_ganadero: z.string().max(100).optional(),
});

// Helper para parsear JSON de FormData si es necesario
const jsonParseTransform = (val) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  }
  return val;
};

export const createPropiedadesSchema = z.object({
  body: z.object({
    codigo_insai: z.string().max(50).optional(),
    nombre: z.string({ required_error: 'El nombre es requerido' }).min(3).max(255),
    rif: z.string().max(50).optional(),
    punto_referencia: z.string().optional(),
    hectareas_totales: z.coerce.number().optional(),
    status: z.string().max(100).default('ACTIVA').optional(),
    tipo_propiedad_id: z.coerce.number().int().positive().optional(),
    due_o_id: z.coerce.number().int().positive().optional(),
    productor: z.preprocess(jsonParseTransform, z.object({
      cedula_rif: z.string().min(6),
      nombre: z.string().min(3),
      codigo_runsai: z.string().optional(),
      telefono: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
      direccion_fiscal: z.string().optional(),
    }).optional()),
    hierro: z.preprocess(jsonParseTransform, hierroSchema.optional()),
    ubicacion: z.preprocess(jsonParseTransform, ubicacionSchema.optional()),
    cultivos: z.preprocess(jsonParseTransform, z.array(cultivoSchema).optional()),
    animales: z.preprocess(jsonParseTransform, z.array(animalSchema).optional()),
  }),
});

export const updatePropiedadesSchema = z.object({
  body: z.object({
    codigo_insai: z.string().max(50).optional(),
    nombre: z.string().min(3).max(255).optional(),
    rif: z.string().max(50).optional(),
    punto_referencia: z.string().optional(),
    hectareas_totales: z.coerce.number().optional(),
    status: z.string().max(100).optional(),
    tipo_propiedad_id: z.coerce.number().int().positive().optional(),
    due_o_id: z.coerce.number().int().positive().optional(),

    hierro: z.preprocess(jsonParseTransform, hierroSchema.optional()),
    ubicacion: z.preprocess(jsonParseTransform, ubicacionSchema.optional()),
    cultivos: z.preprocess(jsonParseTransform, z.array(cultivoSchema).optional()),
    animales: z.preprocess(jsonParseTransform, z.array(animalSchema).optional()),
  }),
});
