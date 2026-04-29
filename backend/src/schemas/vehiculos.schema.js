import { z } from 'zod';

export const createVehiculosSchema = z.object({
  body: z.object({
    placa: z.string({
      required_error: 'La placa es requerida',
    }).min(3).max(20),
    marca: z.string().max(50).optional(),
    modelo: z.string().max(50).optional(),
    tipo: z.enum(['MOTO', 'CARRO', 'CAMIONETA', 'OTRO'], {
      errorMap: () => ({ message: 'Tipo de vehículo no válido' }),
    }).optional(),
    color: z.string().max(30).optional(),
    status: z.string().max(20).default('OPERATIVO').optional(),
  }),
});

export const updateVehiculosSchema = z.object({
  body: z.object({
    placa: z.string().min(3).max(20).optional(),
    marca: z.string().max(50).optional(),
    modelo: z.string().max(50).optional(),
    tipo: z.enum(['MOTO', 'CARRO', 'CAMIONETA', 'OTRO']).optional(),
    color: z.string().max(30).optional(),
    status: z.string().max(20).optional(),
  }),
});
