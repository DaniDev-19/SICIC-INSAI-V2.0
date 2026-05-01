import { z } from 'zod';

export const createSolicitudSchema = z.object({
  body: z.object({
    codigo: z.string().optional(),
    descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
    fecha_resolucion: z.string().optional().nullable(),
    estatus: z.enum([
      'CREADA', 'DIAGNOSTICADA', 'PLANIFICADA', 'INSPECCIONANDO',
      'FINALIZADA', 'NO_APROBADA', 'SEGUIMIENTO', 'CUARENTENA', 'NO_ATENDIDA'
    ]).optional(),
    prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
    medio_recepcion: z.enum(['WEB', 'TELEFONO', 'PRESENCIAL', 'CORREO', 'OFICIO']).optional(),
    tipo_solicitud_id: z.number({ required_error: 'El tipo de solicitud es requerido' }),
    solicitante_id: z.number({ required_error: 'El solicitante es requerido' }),
    atendido_por_id: z.number().optional().nullable(),
    propiedad_id: z.number({ required_error: 'La propiedad es requerida' }),
  })
});

export const updateSolicitudSchema = z.object({
  body: z.object({
    codigo: z.string().optional(),
    descripcion: z.string().min(10).optional(),
    fecha_resolucion: z.string().optional().nullable(),
    estatus: z.enum([
      'CREADA', 'DIAGNOSTICADA', 'PLANIFICADA', 'INSPECCIONANDO',
      'FINALIZADA', 'NO_APROBADA', 'SEGUIMIENTO', 'CUARENTENA', 'NO_ATENDIDA'
    ]).optional(),
    prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
    medio_recepcion: z.enum(['WEB', 'TELEFONO', 'PRESENCIAL', 'CORREO', 'OFICIO']).optional(),
    tipo_solicitud_id: z.number().optional(),
    solicitante_id: z.number().optional(),
    atendido_por_id: z.number().optional().nullable(),
    propiedad_id: z.number().optional(),
  })
});
