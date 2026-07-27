import { Router } from 'express';
import * as tAnimalesController from '../controllers/t_animales.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createTAnimalesSchema, updateTAnimalesSchema } from '../schemas/t_animales.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
//import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route Get /api/t_animales
 * @access Public
*/
router.get('/', tAnimalesController.getTAnimales);


/**
 * @route Get /api/t_animales/:id
 * @access Public
*/
router.get('/:id', tAnimalesController.getTAnimalesById);

/**
 * @route POST /api/t_animales
 * @access Public
*/
router.post('/', validateSchema(createTAnimalesSchema), tAnimalesController.createTAnimales);

/**
 * @route PUT /api/t_animales
 * @access Public
*/
router.put('/:id', validateSchema(updateTAnimalesSchema), tAnimalesController.updateTAnimales);

/**
 * @route DELETE /api/t_animales/:id
 * @access Public
*/
router.delete('/:id', tAnimalesController.deleteTAnimal);

/**
 * @route POST /api/t_animales/bulk-delete
 * @access Public
*/
router.post('/bulk-delete', tAnimalesController.deleteManyTAnimal);

export default router;