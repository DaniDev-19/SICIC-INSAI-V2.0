import { z } from 'zod';

export const createSeguimientoSchema = z.object({
  body: z.object({
    fecha_seguimiento: z.string().optional(),
    hallazgos_seguimiento: z.string().min(10, 'Los hallazgos deben ser detallados'),
    recomendaciones_cumplidas: z.boolean().optional(),
    status: z.string().optional().nullable(),
    inspeccion_id: z.number().optional().nullable(),
    acta_silo_id: z.number().optional().nullable()
  })
}).refine(data => data.body.inspeccion_id || data.body.acta_silo_id, {
  message: "Debe vincular el seguimiento a una inspección o a un acta de silo",
  path: ["body.inspeccion_id"]
});

export const updateSeguimientoSchema = z.object({
  body: z.object({
    fecha_seguimiento: z.string().optional(),
    hallazgos_seguimiento: z.string().min(10).optional(),
    recomendaciones_cumplidas: z.boolean().optional(),
    status: z.string().optional().nullable(),
    inspeccion_id: z.number().optional().nullable(),
    acta_silo_id: z.number().optional().nullable()
  })
});
