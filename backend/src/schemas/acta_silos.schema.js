import { z } from 'zod';

export const createActaSiloSchema = z.object({
  body: z.object({
    semana_epid: z.string().optional().nullable(),
    fecha_notificacion: z.string().optional(),
    lugar_ubicacion: z.string().optional().nullable(),
    cant_nacional: z.number().min(0).optional().nullable(),
    cant_importado: z.number().min(0).optional().nullable(),
    cant_afectado: z.number().min(0).optional().nullable(),
    cant_afectado_porcentaje: z.number().min(0).max(100).optional().nullable(),
    n_silos: z.string().optional().nullable(),
    n_galpones: z.string().optional().nullable(),
    c_instalada: z.string().optional().nullable(),
    c_operativa: z.string().optional().nullable(),
    c_almacenamiento: z.string().optional().nullable(),
    destino_objetivo: z.string().optional().nullable(),
    observaciones: z.string().optional().nullable(),
    medidas_recomendadas: z.string().optional().nullable(),
    evento_id: z.number().optional().nullable(),
    unidad_medida_id: z.number().optional().nullable(),
    planificacion_id: z.number({ required_error: 'La planificación asociada es requerida' })
  })
});

export const updateActaSiloSchema = z.object({
  body: z.object({
    semana_epid: z.string().optional().nullable(),
    fecha_notificacion: z.string().optional(),
    lugar_ubicacion: z.string().optional().nullable(),
    cant_nacional: z.number().min(0).optional().nullable(),
    cant_importado: z.number().min(0).optional().nullable(),
    cant_afectado: z.number().min(0).optional().nullable(),
    cant_afectado_porcentaje: z.number().min(0).max(100).optional().nullable(),
    n_silos: z.string().optional().nullable(),
    n_galpones: z.string().optional().nullable(),
    c_instalada: z.string().optional().nullable(),
    c_operativa: z.string().optional().nullable(),
    c_almacenamiento: z.string().optional().nullable(),
    destino_objetivo: z.string().optional().nullable(),
    observaciones: z.string().optional().nullable(),
    medidas_recomendadas: z.string().optional().nullable(),
    evento_id: z.number().optional().nullable(),
    unidad_medida_id: z.number().optional().nullable(),
    planificacion_id: z.number().optional()
  })
});
