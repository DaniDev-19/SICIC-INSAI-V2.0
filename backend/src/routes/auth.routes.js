import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { loginSchema } from '../schemas/auth.schema.js';
import { protect } from '../middlewares/auth.middleware.js';

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
 * @route GET /api/auth/me
 * @description Obtener información del usuario autenticado (desde cookie)
 * @access Private (Requiere JWT)
 */
router.get('/me', protect, authController.getMe);

/**
 * @route POST /api/auth/logout
 * @description Cerrar sesión (limpieza del lado del cliente)
 * @access Private (Requiere JWT)
 */
router.post('/logout', protect, authController.logout);

export default router;
