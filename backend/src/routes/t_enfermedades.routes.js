import { Router } from 'express';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createTEnfermedadSchema, updateTEnfermedadSchema } from '../schemas/t_enfermedades.schema.js';
import * as TEnfermedadController from '../controllers/t_enfermedades.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
//import { checkPermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route GET /api/t_enfermedad
 *@access Public
*/

router.get('/', TEnfermedadController.getTEnfermedades);

/**
 * @route Get /api/t_enfermedad/:id
 * @access Public
*/
router.get('/:id', TEnfermedadController.getTEnfermedadById);

/**
 * @route POST /api/t_enfermedad
 * @access Public
*/
router.post('/', validateSchema(createTEnfermedadSchema), TEnfermedadController.createTEnfermedad);

/**
 * @route PUT /api/t_enfermedad
 * @access Public
*/
router.put('/:id', validateSchema(updateTEnfermedadSchema), TEnfermedadController.updateTEnfermedad);

/**
 * @route DELETE /api/t_enfermedad/:id
 * @access Public
*/
router.delete('/:id', TEnfermedadController.deleteTEnfermedad);

/**
 * @route POST /api/t_enfermedad/bulk-delete
 * @access Public
*/
router.post('/bulk-delete', TEnfermedadController.deleteManyTEnfermedad);

export default router;
