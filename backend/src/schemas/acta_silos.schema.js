import { z } from 'zod';

const parseJsonField = (val) => {
  if (val === undefined || val === null || val === '') return undefined;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return undefined;
    }
  }
  return val;
};

const emptyToNull = (val) => (val === '' ? null : val);

const coerceNumberOrNull = z.preprocess(
  (val) => (val === '' || val === undefined || val === null ? null : Number(val)),
  z.number().min(0).optional().nullable()
);

const coercePercentOrNull = z.preprocess(
  (val) => (val === '' || val === undefined || val === null ? null : Number(val)),
  z.number().min(0).max(100).optional().nullable()
);

const coerceIntOrNull = z.preprocess(
  (val) => (val === '' || val === undefined || val === null ? null : Number(val)),
  z.number().optional().nullable()
);

const coerceIntRequired = z.preprocess(
  (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
  z.number({ required_error: 'La planificación asociada es requerida' })
);

const insumoConsumidoSchema = z.object({
  insumo_id: z.coerce.number(),
  oficina_id: z.coerce.number(),
  cantidad: z.coerce.number(),
  lote: z.string().optional().nullable(),
});

export const createActaSiloSchema = z.object({
  body: z.object({
    semana_epid: z.preprocess(emptyToNull, z.string().optional().nullable()),
    fecha_notificacion: z.preprocess(emptyToNull, z.string().optional().nullable()),
    lugar_ubicacion: z.preprocess(emptyToNull, z.string().optional().nullable()),
    cant_nacional: coerceNumberOrNull,
    cant_importado: coerceNumberOrNull,
    cant_afectado: coerceNumberOrNull,
    cant_afectado_porcentaje: coercePercentOrNull,
    n_silos: z.preprocess(emptyToNull, z.string().optional().nullable()),
    n_galpones: z.preprocess(emptyToNull, z.string().optional().nullable()),
    c_instalada: z.preprocess(emptyToNull, z.string().optional().nullable()),
    c_operativa: z.preprocess(emptyToNull, z.string().optional().nullable()),
    c_almacenamiento: z.preprocess(emptyToNull, z.string().optional().nullable()),
    destino_objetivo: z.preprocess(emptyToNull, z.string().optional().nullable()),
    observaciones: z.preprocess(emptyToNull, z.string().optional().nullable()),
    medidas_recomendadas: z.preprocess(emptyToNull, z.string().optional().nullable()),
    evento_id: coerceIntOrNull,
    unidad_medida_id: coerceIntOrNull,
    planificacion_id: coerceIntRequired,
    insumos_consumidos: z.preprocess(
      (val) => parseJsonField(val),
      z.array(insumoConsumidoSchema).optional()
    ),
  })
});

export const updateActaSiloSchema = z.object({
  body: z.object({
    semana_epid: z.preprocess(emptyToNull, z.string().optional().nullable()),
    fecha_notificacion: z.preprocess(emptyToNull, z.string().optional().nullable()),
    lugar_ubicacion: z.preprocess(emptyToNull, z.string().optional().nullable()),
    cant_nacional: coerceNumberOrNull,
    cant_importado: coerceNumberOrNull,
    cant_afectado: coerceNumberOrNull,
    cant_afectado_porcentaje: coercePercentOrNull,
    n_silos: z.preprocess(emptyToNull, z.string().optional().nullable()),
    n_galpones: z.preprocess(emptyToNull, z.string().optional().nullable()),
    c_instalada: z.preprocess(emptyToNull, z.string().optional().nullable()),
    c_operativa: z.preprocess(emptyToNull, z.string().optional().nullable()),
    c_almacenamiento: z.preprocess(emptyToNull, z.string().optional().nullable()),
    destino_objetivo: z.preprocess(emptyToNull, z.string().optional().nullable()),
    observaciones: z.preprocess(emptyToNull, z.string().optional().nullable()),
    medidas_recomendadas: z.preprocess(emptyToNull, z.string().optional().nullable()),
    evento_id: coerceIntOrNull,
    unidad_medida_id: coerceIntOrNull,
    planificacion_id: coerceIntOrNull,
    insumos_consumidos: z.preprocess(
      (val) => parseJsonField(val),
      z.array(insumoConsumidoSchema).optional()
    ),
    fotos_eliminadas: z.preprocess(
      (val) => parseJsonField(val),
      z.array(z.coerce.number()).optional()
    ),
  })
});
