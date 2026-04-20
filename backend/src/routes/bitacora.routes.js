import { Router } from 'express';
import * as bitacoraController from '../controllers/bitacora.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.use(protect)

/**
 * @route GET /api/bitacora
 * @description Obtener registros de la bitácora
 * @access Private (ADMIN o Auditoría)
 */
router.get('/', checkPermission('bitacora', 'see'), bitacoraController.getLogs);

/**
 * @route GET /api/bitacora/modulos
 * @description Obtener lista de módulos registrados
 * @access Private
 */
router.get('/modulos', checkPermission('bitacora', 'see'), bitacoraController.getModulos);

export default router;
