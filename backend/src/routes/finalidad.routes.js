import { Router } from 'express';
import * as finalidadController from '../controllers/finalidad.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createFinalidadSchema, updateFinalidadSchema } from '../schemas/finalidad.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
//import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route GET /api/finalidades
 * @access Private
 */
router.get('/', finalidadController.getFinalidades);

/**
 * @route GET /api/finalidades/:id
 * @access Private
 */
router.get('/:id', finalidadController.getFinalidadById);

/**
 * @route POST /api/finalidades
 * @access Private
 */
router.post('/', validateSchema(createFinalidadSchema), finalidadController.createFinalidad);

/**
 * @route PUT /api/finalidades/:id
 * @access Private
 */
router.put('/:id', validateSchema(updateFinalidadSchema), finalidadController.updateFinalidad);

/**
 * @route DELETE /api/finalidades/:id
 * @access Private
 */
router.delete('/:id', finalidadController.deleteFinalidad);

/**
 * @route POST /api/finalidades/bulk-delete
 * @access Private
 */
router.post('/bulk-delete', finalidadController.deleteManyFinalidades);

export default router;
