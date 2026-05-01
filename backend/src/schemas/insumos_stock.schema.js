import { z } from 'zod';

export const manualMovementSchema = z.object({
  body: z.object({
    insumo_id: z.number({ required_error: 'El ID del insumo es requerido' }),
    oficina_id: z.number({ required_error: 'El ID de la oficina es requerido' }),
    tipo_movimiento: z.enum(['ENTRADA', 'SALIDA', 'AJUSTE_MAS', 'AJUSTE_MENOS'], {
      required_error: 'El tipo de movimiento es requerido'
    }),
    cantidad: z.number({ required_error: 'La cantidad es requerida' }).positive(),
    lote: z.string().optional().nullable(),
    fecha_vencimiento: z.string().optional().nullable(),
    observaciones: z.string().optional().nullable()
  })
});

export const updateStockMinimoSchema = z.object({
  body: z.object({
    stock_minimo: z.number({ required_error: 'El stock mínimo es requerido' }).min(0)
  })
});
