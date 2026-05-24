import { z } from 'zod';

const parseJsonField = (val) => {
  if (val === undefined || val === null || val === '') return undefined;
  if (typeof val === 'string') return JSON.parse(val);
  return val;
};

const emptyToNull = (val) => (val === '' ? null : val);

const finalidadItemSchema = z.object({
  finalidad_id: z.coerce.number(),
  objetivo: z.string().optional(),
});

const insumoConsumidoSchema = z.object({
  insumo_id: z.coerce.number(),
  oficina_id: z.coerce.number(),
  cantidad: z.coerce.number(),
  lote: z.string().optional().nullable(),
});

const statusEnum = z.enum([
  'PENDIENTE', 'INSPECCIONANDO', 'FINALIZADA', 'NO_APROBADA',
  'SEGUIMIENTO', 'CUARENTENA', 'NO_ATENDIDA',
]);

const bodyBase = {
  estado_abrev: z.string().min(2).max(4).optional(),
  hora_inspeccion: z.preprocess(emptyToNull, z.string().optional().nullable()),
  atendido_por_nombre: z.preprocess(emptyToNull, z.string().optional().nullable()),
  atendido_por_cedula: z.preprocess(emptyToNull, z.string().optional().nullable()),
  atendido_por_email: z.preprocess(
    emptyToNull,
    z.string().email('Email inválido').optional().nullable()
  ),
  atendido_por_tlf: z.preprocess(emptyToNull, z.string().optional().nullable()),
  insp_utm_norte: z.coerce.number().optional().nullable(),
  insp_utm_este: z.coerce.number().optional().nullable(),
  insp_utm_zona: z.preprocess(emptyToNull, z.string().optional().nullable()),
  google_maps_url: z.preprocess(
    emptyToNull,
    z.string().url('URL de Google Maps inválida').optional().nullable()
  ),
  aspectos_constatados: z.preprocess(emptyToNull, z.string().optional().nullable()),
  medidas_ordenadas: z.preprocess(emptyToNull, z.string().optional().nullable()),
  posee_certificado: z.preprocess(emptyToNull, z.string().optional().nullable()),
  vigencia_dias: z.coerce.number().optional(),
  areas_inspeccion: z.preprocess(
    (val) => parseJsonField(val),
    z.array(z.string()).optional()
  ),
  status: statusEnum.optional(),
  insumos_consumidos: z.preprocess(
    (val) => parseJsonField(val),
    z.array(insumoConsumidoSchema).optional()
  ),
};

export const createInspeccionSchema = z.object({
  body: z.object({
    ...bodyBase,
    fecha_inspeccion: z.string({ required_error: 'La fecha de inspección es requerida' }),
    planificacion_id: z.coerce.number({ required_error: 'La planificación asociada es requerida' }),
    finalidades: z.preprocess(
      (val) => parseJsonField(val),
      z.array(finalidadItemSchema).optional()
    ),
  }),
});

export const updateInspeccionSchema = z.object({
  body: z.object({
    ...bodyBase,
    fecha_inspeccion: z.string().optional(),
    planificacion_id: z.coerce.number().optional(),
    finalidades: z.preprocess(
      (val) => parseJsonField(val),
      z.array(finalidadItemSchema).optional()
    ),
    fotos_eliminadas: z.preprocess(
      (val) => parseJsonField(val),
      z.array(z.coerce.number()).optional()
    ),
  }),
});
