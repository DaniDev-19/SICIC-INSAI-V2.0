import { Router } from 'express';
import * as contratoController from '../controllers/contrato.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createContratoSchema, updateContratoSchema } from '../schemas/contrato.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
//import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route GET /api/contratos
 * @access Private
 */
router.get('/', contratoController.getContratos);

/**
 * @route GET /api/contratos/:id
 * @access Private
 */
router.get('/:id', contratoController.getContratoById);

/**
 * @route POST /api/contratos
 * @access Private
 */
router.post('/', validateSchema(createContratoSchema), contratoController.createContrato);

/**
 * @route PUT /api/contratos/:id
 * @access Private
 */
router.put('/:id', validateSchema(updateContratoSchema), contratoController.updateContrato);

/**
 * @route DELETE /api/contratos/:id
 * @access Private
 */
router.delete('/:id', contratoController.deleteContrato);

/**
 * @route POST /api/contratos/bulk-delete
 * @access Private
 */
router.post('/bulk-delete', contratoController.deleteManyContratos);

export default router;
