import { z } from 'zod';

export const createPlanificacionSchema = z.object({
  body: z.object({
    codigo: z.string().optional(),
    fecha_programada: z.string({ required_error: 'La fecha programada es requerida' }),
    hora_inicio: z.string().optional().nullable(),
    hora_fin: z.string().optional().nullable(),
    prioridad: z.string().optional(),
    actividad: z.string().optional(),
    objetivo: z.string().optional(),
    convocatoria: z.string().optional(),
    punto_encuentro: z.string().optional(),
    ubicacion: z.string().optional(),
    aseguramiento: z.string().optional(),
    vehiculo_id: z.number().optional().nullable(),
    solicitud_id: z.number({ required_error: 'La solicitud asociada es requerida' }),
    status: z.enum([
      'PENDIENTE', 'INSPECCIONANDO', 'FINALIZADA', 'NO_APROBADA',
      'SEGUIMIENTO', 'CUARENTENA', 'NO_ATENDIDA'
    ]).optional(),
    empleados: z.array(z.number()).min(1, 'Debe asignar al menos un empleado a la planificación')
  })
});

export const updatePlanificacionSchema = z.object({
  body: z.object({
    codigo: z.string().optional(),
    fecha_programada: z.string().optional(),
    hora_inicio: z.string().optional().nullable(),
    hora_fin: z.string().optional().nullable(),
    prioridad: z.string().optional(),
    actividad: z.string().optional(),
    objetivo: z.string().optional(),
    convocatoria: z.string().optional(),
    punto_encuentro: z.string().optional(),
    ubicacion: z.string().optional(),
    aseguramiento: z.string().optional(),
    vehiculo_id: z.number().optional().nullable(),
    solicitud_id: z.number().optional(),
    status: z.enum([
      'PENDIENTE', 'INSPECCIONANDO', 'FINALIZADA', 'NO_APROBADA',
      'SEGUIMIENTO', 'CUARENTENA', 'NO_ATENDIDA'
    ]).optional(),
    empleados: z.array(z.number()).optional()
  })
});
