import { Router } from 'express';
import * as tUnidadesController from '../controllers/t_unidades.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createTUnidadSchema, updateTUnidadSchema } from '../schemas/t_unidades.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route GET /api/t_unidades
 * @access Private
 */
router.get('/', checkPermission('t_unidades', 'see'), tUnidadesController.getTUnidades);

/**
 * @route GET /api/t_unidades/:id
 * @access Private
 */
router.get('/:id', checkPermission('t_unidades', 'see'), tUnidadesController.getTUnidadById);

/**
 * @route POST /api/t_unidades
 * @access Private
 */
router.post('/', checkPermission('t_unidades', 'create'), validateSchema(createTUnidadSchema), tUnidadesController.createTUnidad);

/**
 * @route PUT /api/t_unidades/:id
 * @access Private
 */
router.put('/:id', checkPermission('t_unidades', 'update'), validateSchema(updateTUnidadSchema), tUnidadesController.updateTUnidad);

/**
 * @route DELETE /api/t_unidades/:id
 * @access Private
 */
router.delete('/:id', checkPermission('t_unidades', 'delete'), tUnidadesController.deleteTUnidad);

/**
 * @route POST /api/t_unidades/bulk-delete
 * @access Private
 */
router.post('/bulk-delete', checkPermission('t_unidades', 'delete'), tUnidadesController.deleteManyTUnidades);

export default router;
