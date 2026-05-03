import { Router } from 'express';
import * as TPlagasController from '../controllers/t_plagas.controller.js';
import { createTPlagasSchema, updateTPlagasSchema } from '../schemas/t_plagas.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();
router.use(protect);
router.use(tenantMiddleware);

/**
 * @route Get /api/t_plaga
 * @access Private
*/
router.get('/', checkPermission('t_plaga', 'see'), TPlagasController.getTPlaga);


/**
 * @route Get /api/t_plaga/:id
 * @access Private
*/
router.get('/:id', checkPermission('t_plaga', 'see'), TPlagasController.getTPlagaById);

/**
 * @route POST /api/t_plaga
 * @access Private
*/
router.post('/', checkPermission('t_plaga', 'create'), validateSchema(createTPlagasSchema), TPlagasController.createTPlaga);

/**
 * @route PUT /api/t_plaga
 * @access Private
*/
router.put('/:id', checkPermission('t_plaga', 'update'), validateSchema(updateTPlagasSchema), TPlagasController.updateTPlaga);

/**
 * @route DELETE /api/t_plaga/:id
 * @access Private
*/
router.delete('/:id', checkPermission('t_plaga', 'delete'), TPlagasController.deleteTPlaga);

/**
 * @route POST /api/t_plaga/bulk-delete
 * @access Private
*/
router.post('/bulk-delete', checkPermission('t_plaga', 'delete'), TPlagasController.deleteManyTPlagas);

export default router;