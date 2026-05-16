import { z } from 'zod';

const residenciaSchema = z.object({
  sector_id: z.coerce.number().int().positive().optional(),
  direccion_detallada: z.string().optional(),
  punto_referencia: z.string().optional(),
  google_maps_url: z.string().url().optional().or(z.literal('')),
  es_principal: z.boolean().default(true).optional(),
});

const jsonParser = (val) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
};

export const createEmpleadosSchema = z.object({
  body: z.object({
    cedula: z.string({ required_error: 'La cédula es requerida' }).min(5).max(20),
    nombre: z.string({ required_error: 'El nombre es requerido' }).min(2).max(100),
    apellido: z.string({ required_error: 'El apellido es requerido' }).min(2).max(100),
    telefono: z.string().max(50).optional(),
    email: z.string().email().max(100).optional().or(z.literal('')),
    fechas_ingreso: z.string().optional().or(z.literal('')),
    status_laboral: z.string().max(100).default('ACTIVO').optional(),
    contrato_id: z.coerce.number().int().positive().optional(),
    cargo_id: z.coerce.number().int().positive().optional(),
    departamento_id: z.coerce.number().int().positive().optional(),
    profesion_id: z.coerce.number().int().positive().optional(),
    oficina_id: z.coerce.number().int().positive().optional(),
    usuario_global_id: z.coerce.number().int().positive().optional(),
    
    // Relaciones anidadas (pueden venir como string JSON desde FormData)
    foto_url: z.string().url().optional(),
    residencia: z.preprocess(jsonParser, residenciaSchema.optional()),
    programas_ids: z.preprocess(jsonParser, z.array(z.coerce.number().int().positive()).optional()),
  }),
});

export const updateEmpleadosSchema = z.object({
  body: z.object({
    cedula: z.string().min(5).max(20).optional(),
    nombre: z.string().min(2).max(100).optional(),
    apellido: z.string().min(2).max(100).optional(),
    telefono: z.string().max(50).optional(),
    email: z.string().email().max(100).optional().or(z.literal('')),
    fechas_ingreso: z.string().optional(),
    status_laboral: z.string().max(100).optional(),
    contrato_id: z.coerce.number().int().positive().optional(),
    cargo_id: z.coerce.number().int().positive().optional(),
    departamento_id: z.coerce.number().int().positive().optional(),
    profesion_id: z.coerce.number().int().positive().optional(),
    oficina_id: z.coerce.number().int().positive().optional(),
    usuario_global_id: z.coerce.number().int().positive().optional(),
    
    foto_url: z.string().url().optional(),
    residencia: z.preprocess(jsonParser, residenciaSchema.optional()),
    programas_ids: z.preprocess(jsonParser, z.array(z.coerce.number().int().positive()).optional()),
  }),
});
