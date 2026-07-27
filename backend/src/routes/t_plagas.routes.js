import { Router } from 'express';
import * as TPlagasController from '../controllers/t_plagas.controller.js';
import { createTPlagasSchema, updateTPlagasSchema } from '../schemas/t_plagas.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
//import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();
router.use(protect);
router.use(tenantMiddleware);

/**
 * @route Get /api/t_plaga
 * @access Public
*/
router.get('/', TPlagasController.getTPlaga);


/**
 * @route Get /api/t_plaga/:id
 * @access Public
*/
router.get('/:id', TPlagasController.getTPlagaById);

/**
 * @route POST /api/t_plaga
 * @access Public
*/
router.post('/', validateSchema(createTPlagasSchema), TPlagasController.createTPlaga);

/**
 * @route PUT /api/t_plaga
 * @access Private
*/
router.put('/:id', validateSchema(updateTPlagasSchema), TPlagasController.updateTPlaga);

/**
 * @route DELETE /api/t_plaga/:id
 * @access Public
*/
router.delete('/:id', TPlagasController.deleteTPlaga);

/**
 * @route POST /api/t_plaga/bulk-delete
 * @access Public
*/
router.post('/bulk-delete', TPlagasController.deleteManyTPlagas);

export default router;
