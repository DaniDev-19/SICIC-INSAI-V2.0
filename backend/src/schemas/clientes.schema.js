import { z } from 'zod';

export const createClientesSchema = z.object({
  body: z.object({
    cedula_rif: z.string({ required_error: 'La cédula o RIF es requerida' }).min(5).max(20),
    nombre: z.string({ required_error: 'El nombre es requerido' }).min(3).max(255),
    codigo_runsai: z.string().max(50).optional(),
    telefono: z.string().max(50).optional(),
    email: z.string().email().max(100).optional().or(z.literal('')),
    direccion_fiscal: z.string().optional(),
  }),
});

export const updateClientesSchema = z.object({
  body: z.object({
    cedula_rif: z.string().min(5).max(20).optional(),
    nombre: z.string().min(3).max(255).optional(),
    codigo_runsai: z.string().max(50).optional(),
    telefono: z.string().max(50).optional(),
    email: z.string().email().max(100).optional().or(z.literal('')),
    direccion_fiscal: z.string().optional(),
  }),
});
