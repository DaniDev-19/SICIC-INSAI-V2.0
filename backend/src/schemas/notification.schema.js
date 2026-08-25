import { z } from 'zod';

export const createNotificationSchema = z.object({
  body: z.object({
    usuario_global_id: z.number({ required_error: 'El ID de usuario es requerido' }).int().positive(),
    mensaje: z.string({ required_error: 'El mensaje es requerido' }).min(1, 'El mensaje no puede estar vacío').max(1000, 'El mensaje es demasiado largo'),
    tipo: z.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR', 'STOCK', 'INSPECCION', 'SOLICITUD']).default('INFO').optional(),
  }),
});

export const queryNotificationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    unreadOnly: z.enum(['true', 'false']).optional(),
    tipo: z.string().optional(),
  }),
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('ID de notificación inválido'),
  }),
});
