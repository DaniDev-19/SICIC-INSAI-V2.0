import { Router } from 'express';
import * as oficinasController from '../controllers/oficinas.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createOficinaSchema, updateOficinaSchema } from '../schemas/oficinas.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route GET /api/oficinas
 * @access Private
 */
router.get('/', checkPermission('oficinas', 'see'), oficinasController.getOficinas);

/**
 * @route GET /api/oficinas/:id
 * @access Private
 */
router.get('/:id', checkPermission('oficinas', 'see'), oficinasController.getOficinaById);

/**
 * @route POST /api/oficinas
 * @access Private
 */
router.post('/', checkPermission('oficinas', 'create'), validateSchema(createOficinaSchema), oficinasController.createOficina);

/**
 * @route PUT /api/oficinas/:id
 * @access Private
 */
router.put('/:id', checkPermission('oficinas', 'update'), validateSchema(updateOficinaSchema), oficinasController.updateOficina);

/**
 * @route DELETE /api/oficinas/:id
 * @access Private
 */
router.delete('/:id', checkPermission('oficinas', 'delete'), oficinasController.deleteOficina);

/**
 * @route POST /api/oficinas/bulk-delete
 * @access Private
 */
router.post('/bulk-delete', checkPermission('oficinas', 'delete'), oficinasController.deleteManyOficinas);

export default router;
