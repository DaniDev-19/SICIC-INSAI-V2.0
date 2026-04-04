import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'El email es obligatorio',
      })
      .email('El formato del email no es válido'),
    password: z
      .string({
        required_error: 'La contraseña es obligatoria',
      })
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  }),
});
