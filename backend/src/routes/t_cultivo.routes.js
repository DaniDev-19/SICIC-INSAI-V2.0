import { Router } from 'express';
import * as tCultivoController from '../controllers/t_cultivo.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createTCultivoSchema, updateTCultivoSchema } from '../schemas/t_cultivo.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route Get /api/t_cultivo
 * @access Private
*/
router.get('/', checkPermission('t_cultivo', 'see'), tCultivoController.getTCultivo);


/**
 * @route Get /api/t_cultivo/:id
 * @access Private
*/
router.get('/:id', checkPermission('t_cultivo', 'see'), tCultivoController.getTCultivoById);

/**
 * @route POST /api/t_cultivo
 * @access Private
*/
router.post('/', checkPermission('t_cultivo', 'create'), validateSchema(createTCultivoSchema), tCultivoController.createTCultivo);

/**
 * @route PUT /api/t_cultivo
 * @access Private
*/
router.put('/:id', checkPermission('t_cultivo', 'update'), validateSchema(updateTCultivoSchema), tCultivoController.updateTCultivo);

/**
 * @route DELETE /api/t_cultivo/:id
 * @access Private
*/
router.delete('/:id', checkPermission('t_cultivo', 'delete'), tCultivoController.deleteTCultivo);

/**
 * @route POST /api/t_cultivo/bulk-delete
 * @access Private
*/
router.post('/bulk-delete', checkPermission('t_cultivo', 'delete'), tCultivoController.deleteManyTCultivo);

export default router;