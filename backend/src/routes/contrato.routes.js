import { Router } from 'express';
import * as contratoController from '../controllers/contrato.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createContratoSchema, updateContratoSchema } from '../schemas/contrato.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route GET /api/contratos
 * @access Private
 */
router.get('/', checkPermission('contratos', 'see'), contratoController.getContratos);

/**
 * @route GET /api/contratos/:id
 * @access Private
 */
router.get('/:id', checkPermission('contratos', 'see'), contratoController.getContratoById);

/**
 * @route POST /api/contratos
 * @access Private
 */
router.post('/', checkPermission('contratos', 'create'), validateSchema(createContratoSchema), contratoController.createContrato);

/**
 * @route PUT /api/contratos/:id
 * @access Private
 */
router.put('/:id', checkPermission('contratos', 'update'), validateSchema(updateContratoSchema), contratoController.updateContrato);

/**
 * @route DELETE /api/contratos/:id
 * @access Private
 */
router.delete('/:id', checkPermission('contratos', 'delete'), contratoController.deleteContrato);

/**
 * @route POST /api/contratos/bulk-delete
 * @access Private
 */
router.post('/bulk-delete', checkPermission('contratos', 'delete'), contratoController.deleteManyContratos);

export default router;
