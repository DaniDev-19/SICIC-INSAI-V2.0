import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import {
  loginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  enableMfaSchema,
  disableMfaSchema,
  verifyMfaLoginSchema,
  regenerateBackupCodesSchema,
} from '../schemas/auth.schema.js';
import { protect, optionalProtect } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @route GET /api/auth/instances
 * @description Listar las instancias activas para el selector de login
 * @access Public
 */
router.get('/instances', authController.getInstances);

/**
 * @route POST /api/auth/login
 * @description Iniciar sesión y obtener token JWT junto con instancias accesibles
 * @access Public
 */
router.post('/login', validateSchema(loginSchema), authController.login);

/**
 * @route POST /api/auth/mfa/verify-login
 * @description Verificar el código TOTP o de respaldo para completar inicio de sesión
 * @access Public (con token temporal mfaPendingToken)
 */
router.post(
  '/mfa/verify-login',
  validateSchema(verifyMfaLoginSchema),
  authController.verifyMfaLogin
);

/**
 * @route POST /api/auth/request-password-reset
 * @description Solicitar token/código de recuperación de contraseña
 * @access Public
 */
router.post(
  '/request-password-reset',
  validateSchema(requestPasswordResetSchema),
  authController.requestPasswordReset
);

/**
 * @route POST /api/auth/reset-password
 * @description Restablecer la contraseña con el token/código enviado
 * @access Public
 */
router.post(
  '/reset-password',
  validateSchema(resetPasswordSchema),
  authController.resetPassword
);

/**
 * @route GET /api/auth/me
 * @description Obtener información del usuario autenticado (desde cookie)
 * @access Private (Requiere JWT)
 */
router.get('/me', protect, authController.getMe);

/**
 * @route PUT /api/auth/profile
 * @description Actualizar perfil de usuario (username, email)
 * @access Private (Requiere JWT)
 */
router.put(
  '/profile',
  protect,
  validateSchema(updateProfileSchema),
  authController.updateMyProfile
);

/**
 * @route POST /api/auth/change-password
 * @description Cambiar contraseña propia de forma segura
 * @access Private (Requiere JWT)
 */
router.post(
  '/change-password',
  protect,
  validateSchema(changePasswordSchema),
  authController.changeMyPassword
);

/**
 * @route POST /api/auth/mfa/setup
 * @description Generar secreto y código QR para activación de MFA
 * @access Private (Requiere JWT)
 */
router.post('/mfa/setup', protect, authController.setupMfa);

/**
 * @route POST /api/auth/mfa/enable
 * @description Confirmar token de 6 dígitos y activar MFA
 * @access Private (Requiere JWT)
 */
router.post(
  '/mfa/enable',
  protect,
  validateSchema(enableMfaSchema),
  authController.enableMfa
);

/**
 * @route POST /api/auth/mfa/disable
 * @description Desactivar MFA con confirmación de contraseña y token
 * @access Private (Requiere JWT)
 */
router.post(
  '/mfa/disable',
  protect,
  validateSchema(disableMfaSchema),
  authController.disableMfa
);

/**
 * @route POST /api/auth/mfa/regenerate-backup-codes
 * @description Regenerar los 8 códigos de respaldo de emergencia
 * @access Private (Requiere JWT)
 */
router.post(
  '/mfa/regenerate-backup-codes',
  protect,
  validateSchema(regenerateBackupCodesSchema),
  authController.regenerateBackupCodes
);

/**
 * @route POST /api/auth/logout
 * @description Cerrar sesión (limpieza del lado del cliente)
 * @access Private (Requiere JWT)
 */
router.post('/logout', optionalProtect, authController.logout);

export default router;
