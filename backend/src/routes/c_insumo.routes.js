import { Router } from 'express';
import * as CInsumosControllers from '../controllers/c_insumos.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createCInsumosSchema, updateCInsumosSchema } from '../schemas/c_insumos.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route Get /api/c_insumos
 * @access Private
*/
router.get('/', checkPermission('c_insumos', 'see'), CInsumosControllers.getCInsumos);


/**
 * @route Get /api/c_insumos/:id
 * @access Private
*/
router.get('/:id', checkPermission('c_insumos', 'see'), CInsumosControllers.getCInsumosById);

/**
 * @route POST /api/c_insumos
 * @access Private
*/
router.post('/', checkPermission('c_insumos', 'create'), validateSchema(createCInsumosSchema), CInsumosControllers.createCInsumos);

/**
 * @route PUT /api/c_insumos
 * @access Private
*/
router.put('/:id', checkPermission('c_insumos', 'update'), validateSchema(updateCInsumosSchema), CInsumosControllers.updateCInsumos);

/**
 * @route DELETE /api/c_insumos/:id
 * @access Private
*/
router.delete('/:id', checkPermission('c_insumos', 'delete'), CInsumosControllers.deleteCInsumos);

/**
 * @route POST /api/c_insumos/bulk-delete
 * @access Private
*/
router.post('/bulk-delete', checkPermission('c_insumos', 'delete'), CInsumosControllers.deleteManyCInsumos);

export default router;