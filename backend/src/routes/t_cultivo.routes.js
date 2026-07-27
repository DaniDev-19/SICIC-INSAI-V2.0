import { Router } from 'express';
import * as tCultivoController from '../controllers/t_cultivo.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createTCultivoSchema, updateTCultivoSchema } from '../schemas/t_cultivo.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
//import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route Get /api/t_cultivo
 * @access Public
*/
router.get('/', tCultivoController.getTCultivo);


/**
 * @route Get /api/t_cultivo/:id
 * @access Public
*/
router.get('/:id', tCultivoController.getTCultivoById);

/**
 * @route POST /api/t_cultivo
 * @access Public
*/
router.post('/', validateSchema(createTCultivoSchema), tCultivoController.createTCultivo);

/**
 * @route PUT /api/t_cultivo
 * @access Public
*/
router.put('/:id', validateSchema(updateTCultivoSchema), tCultivoController.updateTCultivo);

/**
 * @route DELETE /api/t_cultivo/:id
 * @access Public
*/
router.delete('/:id', tCultivoController.deleteTCultivo);

/**
 * @route POST /api/t_cultivo/bulk-delete
 * @access Public
*/
router.post('/bulk-delete',  tCultivoController.deleteManyTCultivo);

export default router;
