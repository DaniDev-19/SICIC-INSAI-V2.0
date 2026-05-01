import { z } from 'zod';

export const createInspeccionSchema = z.object({
  body: z.object({
    n_control: z.string().optional(),
    t_codigo: z.string().optional(),
    fecha_inspeccion: z.string({ required_error: 'La fecha de inspección es requerida' }),
    hora_inspeccion: z.string().optional().nullable(),
    atendido_por_nombre: z.string().optional().nullable(),
    atendido_por_cedula: z.string().optional().nullable(),
    atendido_por_email: z.string().email('Email inválido').optional().nullable(),
    atendido_por_tlf: z.string().optional().nullable(),
    insp_utm_norte: z.number().optional().nullable(),
    insp_utm_este: z.number().optional().nullable(),
    insp_utm_zona: z.string().optional().nullable(),
    google_maps_url: z.string().url('URL de Google Maps inválida').optional().nullable(),
    aspectos_constatados: z.string().optional().nullable(),
    medidas_ordenadas: z.string().optional().nullable(),
    posee_certificado: z.string().optional().nullable(),
    vigencia_dias: z.number().optional(),
    status: z.enum([
      'PENDIENTE', 'INSPECCIONANDO', 'FINALIZADA', 'NO_APROBADA',
      'SEGUIMIENTO', 'CUARENTENA', 'NO_ATENDIDA'
    ]).optional(),
    planificacion_id: z.number({ required_error: 'La planificación asociada es requerida' }),
    finalidades: z.array(z.object({
      finalidad_id: z.number(),
      objetivo: z.string().optional()
    })).min(1, 'Debe indicar al menos una finalidad para la inspección')
  })
});

export const updateInspeccionSchema = z.object({
  body: z.object({
    n_control: z.string().optional(),
    t_codigo: z.string().optional(),
    fecha_inspeccion: z.string().optional(),
    hora_inspeccion: z.string().optional().nullable(),
    atendido_por_nombre: z.string().optional().nullable(),
    atendido_por_cedula: z.string().optional().nullable(),
    atendido_por_email: z.string().email('Email inválido').optional().nullable(),
    atendido_por_tlf: z.string().optional().nullable(),
    insp_utm_norte: z.number().optional().nullable(),
    insp_utm_este: z.number().optional().nullable(),
    insp_utm_zona: z.string().optional().nullable(),
    google_maps_url: z.string().url('URL de Google Maps inválida').optional().nullable(),
    aspectos_constatados: z.string().optional().nullable(),
    medidas_ordenadas: z.string().optional().nullable(),
    posee_certificado: z.string().optional().nullable(),
    vigencia_dias: z.number().optional(),
    status: z.enum([
      'PENDIENTE', 'INSPECCIONANDO', 'FINALIZADA', 'NO_APROBADA',
      'SEGUIMIENTO', 'CUARENTENA', 'NO_ATENDIDA'
    ]).optional(),
    planificacion_id: z.number().optional(),
    finalidades: z.array(z.object({
      finalidad_id: z.number(),
      objetivo: z.string().optional()
    })).optional()
  })
});
