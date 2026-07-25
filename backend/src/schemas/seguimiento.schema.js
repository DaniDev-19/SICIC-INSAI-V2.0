import { z } from 'zod';

const coerceIntOrNull = z.preprocess((val) => {
  if (val === undefined) return undefined;
  if (val === null || val === '' || val === 'null' || val === 'undefined') return null;
  const num = Number(val);
  return isNaN(num) ? val : num;
}, z.number().nullable().optional());

const coerceBoolean = z.preprocess((val) => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    if (val === 'true') return true;
    if (val === 'false') return false;
  }
  return val;
}, z.boolean().optional());

export const createSeguimientoSchema = z.object({
  body: z.object({
    fecha_seguimiento: z.string().optional(),
    hallazgos_seguimiento: z.string().min(10, 'Los hallazgos deben ser detallados (mínimo 10 caracteres)'),
    recomendaciones_cumplidas: coerceBoolean,
    status: z.string().optional().nullable(),
    inspeccion_id: coerceIntOrNull,
    acta_silo_id: coerceIntOrNull
  })
}).refine(data => data.body.inspeccion_id || data.body.acta_silo_id, {
  message: "Debe vincular el seguimiento a una inspección o a un acta de silo",
  path: ["body.inspeccion_id"]
});

export const updateSeguimientoSchema = z.object({
  body: z.object({
    fecha_seguimiento: z.string().optional(),
    hallazgos_seguimiento: z.string().min(10).optional(),
    recomendaciones_cumplidas: coerceBoolean,
    status: z.string().optional().nullable(),
    inspeccion_id: coerceIntOrNull,
    acta_silo_id: coerceIntOrNull
  })
});
