import { Router } from 'express';
import * as cargoController from '../controllers/cargo.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createCargoSchema, updateCargoSchema } from '../schemas/cargo.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.use(protect);

/** 
 * @route GET /api/cargos
 * @access Private
 */
router.get('/', checkPermission('cargos', 'see'), cargoController.getCargos);
 
/** 
 * @route GET /api/cargos/:id
 * @access Private
 */
router.get('/:id', checkPermission('cargos', 'see'), cargoController.getCargoById);
 
/** 
 * @route POST /api/cargos
 * @access Private
 */
router.post('/', checkPermission('cargos', 'create'), validateSchema(createCargoSchema), cargoController.createCargo);
 
/** 
 * @route PUT /api/cargos/:id
 * @access Private
 */
router.put('/:id', checkPermission('cargos', 'update'), validateSchema(updateCargoSchema), cargoController.updateCargo);
 
/** 
 * @route DELETE /api/cargos/:id
 * @access Private
 */
router.delete('/:id', checkPermission('cargos', 'delete'), cargoController.deleteCargo);
 
/** 
 * @route POST /api/cargos/bulk-delete
 * @access Private
 */
router.post('/bulk-delete', checkPermission('cargos', 'delete'), cargoController.deleteManyCargos);

export default router;
