import { Router } from 'express';
import * as tAnimalesController from '../controllers/t_animales.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createTAnimalesSchema, updateTAnimalesSchema } from '../schemas/t_animales.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route Get /api/t_animales
 * @access Private
*/
router.get('/', checkPermission('t_animales', 'see'), tAnimalesController.getTAnimales);


/**
 * @route Get /api/t_animales/:id
 * @access Private
*/
router.get('/:id', checkPermission('t_animales', 'see'), tAnimalesController.getTAnimalesById);

/**
 * @route POST /api/t_animales
 * @access Private
*/
router.post('/', checkPermission('t_animales', 'create'), validateSchema(createTAnimalesSchema), tAnimalesController.createTAnimales);

/**
 * @route PUT /api/t_animales
 * @access Private
*/
router.put('/:id', checkPermission('t_animales', 'update'), validateSchema(updateTAnimalesSchema), tAnimalesController.updateTAnimales);

/**
 * @route DELETE /api/t_animales/:id
 * @access Private
*/
router.delete('/:id', checkPermission('t_animales', 'delete'), tAnimalesController.deleteTAnimal);

/**
 * @route POST /api/t_animales/bulk-delete
 * @access Private
*/
router.post('/bulk-delete', checkPermission('t_animales', 'delete'), tAnimalesController.deleteManyTAnimal);

export default router;