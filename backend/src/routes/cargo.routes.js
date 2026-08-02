import { Router } from 'express';
import * as cargoController from '../controllers/cargo.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createCargoSchema, updateCargoSchema } from '../schemas/cargo.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
//import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route GET /api/cargos
 * @access Private
 */
router.get('/', cargoController.getCargos);

/**
 * @route GET /api/cargos/:id
 * @access Private
 */
router.get('/:id', cargoController.getCargoById);

/**
 * @route POST /api/cargos
 * @access Private
 */
router.post('/', validateSchema(createCargoSchema), cargoController.createCargo);

/**
 * @route PUT /api/cargos/:id
 * @access Private
 */
router.put('/:id', validateSchema(updateCargoSchema), cargoController.updateCargo);

/**
 * @route DELETE /api/cargos/:id
 * @access Private
 */
router.delete('/:id', cargoController.deleteCargo);

/**
 * @route POST /api/cargos/bulk-delete
 * @access Private
 */
router.post('/bulk-delete', cargoController.deleteManyCargos);

export default router;
