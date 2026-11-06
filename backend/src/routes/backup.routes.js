import { Router } from 'express';
import * as backupController from '../controllers/backup.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

const canSee = checkPermission('configuracion', 'see');
const canEdit = checkPermission('configuracion', 'edit');

/**
 * @route GET /api/backup
 * @description Listar todos los respaldos y estadísticas
 */
router.get('/', canSee, backupController.getRespaldos);

/**
 * @route POST /api/backup/manual
 * @description Generar un respaldo manual en este instante
 */
router.post('/manual', canEdit, backupController.crearRespaldoManual);

/**
 * @route GET /api/backup/download/:filename
 * @description Descargar archivo de respaldo SQL
 */
router.get('/download/:filename', canSee, backupController.descargarRespaldo);

/**
 * @route DELETE /api/backup/:filename
 * @description Eliminar archivo de respaldo
 */
router.delete('/:filename', canEdit, backupController.eliminarRespaldo);

/**
 * @route GET /api/backup/config
 * @description Obtener configuración de respaldos automáticos
 */
router.get('/config', canSee, backupController.getConfiguracion);

/**
 * @route PUT /api/backup/config
 * @description Actualizar configuración de respaldos automáticos
 */
router.put('/config', canEdit, backupController.guardarConfiguracion);

export default router;

