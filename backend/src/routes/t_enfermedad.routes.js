import { Router } from 'express';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createTEnfermedadSchema, updateTEnfermedadSchema } from '../schemas/t_enfermedades.schema.js';
import * as TEnfermedadController from '../controllers/t_enfermedad.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route GET /api/t_enfermedad
 *@access Private
*/

router.get('/', checkPermission('t_enfermedad', 'see'), TEnfermedadController.getTEnfermedades);

/**
 * @route Get /api/t_enfermedad/:id
 * @access Private
*/
router.get('/:id', checkPermission('t_enfermedad', 'see'), TEnfermedadController.getTEnfermedadById);

/**
 * @route POST /api/t_enfermedad
 * @access Private
*/
router.post('/', checkPermission('t_enfermedad', 'create'), validateSchema(createTEnfermedadSchema), TEnfermedadController.createTEnfermedad);

/**
 * @route PUT /api/t_enfermedad
 * @access Private
*/
router.put('/:id', checkPermission('t_enfermedad', 'update'), validateSchema(updateTEnfermedadSchema), TEnfermedadController.updateTEnfermedad);

/**
 * @route DELETE /api/t_enfermedad/:id
 * @access Private
*/
router.delete('/:id', checkPermission('t_enfermedad', 'delete'), TEnfermedadController.deleteTEnfermedad);

/**
 * @route POST /api/t_enfermedad/bulk-delete
 * @access Private
*/
router.post('/bulk-delete', checkPermission('t_enfermedad', 'delete'), TEnfermedadController.deleteManyTEnfermedad);

export default router;