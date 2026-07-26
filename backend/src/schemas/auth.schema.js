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
    instanceId: z.string({
      required_error: 'Debe seleccionar una instancia para continuar',
    }).min(1, 'Debe seleccionar una instancia para continuar'),
  }),
});

export const requestPasswordResetSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'El email es obligatorio' })
      .email('El formato del email no es válido'),
    instanceId: z
      .string({ required_error: 'Debe seleccionar una instancia para continuar' })
      .min(1, 'Debe seleccionar una instancia para continuar'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'El email es obligatorio' })
      .email('El formato del email no es válido'),
    instanceId: z
      .string({ required_error: 'Debe seleccionar una instancia para continuar' })
      .min(1, 'Debe seleccionar una instancia para continuar'),
    token: z
      .string({ required_error: 'El código de recuperación es obligatorio' })
      .min(4, 'El código debe tener al menos 4 caracteres'),
    newPassword: z
      .string({ required_error: 'La nueva contraseña es obligatoria' })
      .min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: 'El nombre de usuario es obligatorio' })
      .min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
    email: z
      .string({ required_error: 'El email es obligatorio' })
      .email('El formato del email no es válido'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string({ required_error: 'La contraseña actual es obligatoria' }),
    newPassword: z
      .string({ required_error: 'La nueva contraseña es obligatoria' })
      .min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z
      .string({ required_error: 'La confirmación de la contraseña es obligatoria' }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  }),
});

export const enableMfaSchema = z.object({
  body: z.object({
    secret: z.string({ required_error: 'El secreto MFA es obligatorio' }),
    token: z
      .string({ required_error: 'El código de verificación es obligatorio' })
      .min(6, 'El código debe tener al menos 6 caracteres'),
  }),
});

export const disableMfaSchema = z.object({
  body: z.object({
    currentPassword: z.string({ required_error: 'La contraseña actual es obligatoria' }),
    token: z
      .string({ required_error: 'El código de verificación es obligatorio' })
      .min(6, 'El código debe tener al menos 6 caracteres'),
  }),
});

export const verifyMfaLoginSchema = z.object({
  body: z.object({
    mfaPendingToken: z.string({ required_error: 'El token temporal de autenticación es obligatorio' }),
    code: z
      .string({ required_error: 'El código de verificación es obligatorio' })
      .min(6, 'El código debe tener al menos 6 caracteres'),
  }),
});

export const regenerateBackupCodesSchema = z.object({
  body: z.object({
    token: z
      .string({ required_error: 'El código de verificación es obligatorio' })
      .min(6, 'El código debe tener al menos 6 caracteres'),
  }),
});



