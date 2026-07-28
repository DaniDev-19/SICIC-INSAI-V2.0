import { Router } from 'express';
import * as sectorController from '../controllers/sector.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createSectorSchema, updateSectorSchema } from '../schemas/sector.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
//import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route GET /api/sectores
 * @access Private
 */
router.get('/', sectorController.getSectores);

/**
 * @route GET /api/sectores/:id
 * @access Private
 */
router.get('/:id', sectorController.getSectorById);

/**
 * @route POST /api/sectores
 * @access Private
 */
router.post('/', validateSchema(createSectorSchema), sectorController.createSector);

/**
 * @route PUT /api/sectores/:id
 * @access Private
 */
router.put('/:id', validateSchema(updateSectorSchema), sectorController.updateSector);

/**
 * @route DELETE /api/sectores/:id
 * @access Private
 */
router.delete('/:id', sectorController.deleteSector);

/**
 * @route POST /api/sectores/bulk-delete
 * @access Private
 */
router.post('/bulk-delete', sectorController.deleteManySectores);

export default router;
