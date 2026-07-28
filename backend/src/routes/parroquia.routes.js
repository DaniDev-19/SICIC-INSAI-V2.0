import { Router } from 'express';
import * as parroquiaController from '../controllers/parroquia.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createParroquiaSchema, updateParroquiaSchema } from '../schemas/parroquia.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
//import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route GET /api/parroquias
 * @access Private
 */
router.get('/', parroquiaController.getParroquias);

/**
 * @route GET /api/parroquias/:id
 * @access Private
 */
router.get('/:id', parroquiaController.getParroquiaById);

/**
 * @route POST /api/parroquias
 * @access Private
 */
router.post('/', validateSchema(createParroquiaSchema), parroquiaController.createParroquia);

/**
 * @route PUT /api/parroquias/:id
 * @access Private
 */
router.put('/:id', validateSchema(updateParroquiaSchema), parroquiaController.updateParroquia);

/**
 * @route DELETE /api/parroquias/:id
 * @access Private
 */
router.delete('/:id', parroquiaController.deleteParroquia);

/**
 * @route POST /api/parroquias/bulk-delete
 * @access Private
 */
router.post('/bulk-delete', parroquiaController.deleteManyParroquias);

export default router;
