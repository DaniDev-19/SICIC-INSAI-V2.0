import { Router } from 'express';
import * as estadoController from '../controllers/estado.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createEstadoSchema, updateEstadoSchema } from '../schemas/estado.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
//import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route GET /api/estados
 * @access Private
 */
router.get('/',  estadoController.getEstados);

/**
 * @route GET /api/estados/:id
 * @access Private
 */
router.get('/:id', estadoController.getEstadoById);

/**
 * @route POST /api/estados
 * @access Private
 */
router.post('/', validateSchema(createEstadoSchema), estadoController.createEstado);

/**
 * @route PUT /api/estados/:id
 * @access Private
 */
router.put('/:id', validateSchema(updateEstadoSchema), estadoController.updateEstado);

/**
 * @route DELETE /api/estados/:id
 * @access Private
 */
router.delete('/:id', estadoController.deleteEstado);

/**
 * @route POST /api/estados/bulk-delete
 * @access Private
 */
router.post('/bulk-delete', estadoController.deleteManyEstados);

export default router;
