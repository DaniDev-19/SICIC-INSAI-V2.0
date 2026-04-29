import { Router } from 'express';
import * as enfermedadController from '../controllers/enfermedad.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createEnfermedadSchema, updateEnfermedadSchema } from '../schemas/enfermedad.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/** 
 * @route GET /api/enfermedades
 * @access Private
 */
router.get('/', checkPermission('enfermedades', 'see'), enfermedadController.getEnfermedades);
 
/** 
 * @route GET /api/enfermedades/:id
 * @access Private
 */
router.get('/:id', checkPermission('enfermedades', 'see'), enfermedadController.getEnfermedadById);
 
/** 
 * @route POST /api/enfermedades
 * @access Private
 */
router.post('/', checkPermission('enfermedades', 'create'), validateSchema(createEnfermedadSchema), enfermedadController.createEnfermedad);
 
/** 
 * @route PUT /api/enfermedades/:id
 * @access Private
 */
router.put('/:id', checkPermission('enfermedades', 'update'), validateSchema(updateEnfermedadSchema), enfermedadController.updateEnfermedad);
 
/** 
 * @route DELETE /api/enfermedades/:id
 * @access Private
 */
router.delete('/:id', checkPermission('enfermedades', 'delete'), enfermedadController.deleteEnfermedad);
 
/** 
 * @route POST /api/enfermedades/bulk-delete
 * @access Private
 */
router.post('/bulk-delete', checkPermission('enfermedades', 'delete'), enfermedadController.deleteManyEnfermedades);

export default router;
