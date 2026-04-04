import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { loginSchema } from '../schemas/auth.schema.js';

const router = Router();

/**
 * @route POST /api/auth/login
 * @description Iniciar sesión y obtener token JWT junto con instancias accesibles
 * @access Public
 */
router.post('/login', validateSchema(loginSchema), authController.login);

/**
 * @route POST /api/auth/logout
 * @description Cerrar sesión (limpieza del lado del cliente)
 * @access Private (Requiere JWT)
 */
router.post('/logout', authController.logout);

export default router;
