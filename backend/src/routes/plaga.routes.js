import { Router } from 'express';
import * as plagaController from '../controllers/plaga.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createPlagaSchema, updatePlagaSchema } from '../schemas/plaga.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/** 
 * @route GET /api/plagas
 * @access Private
 */
router.get('/', checkPermission('plagas', 'see'), plagaController.getPlagas);
 
/** 
 * @route GET /api/plagas/:id
 * @access Private
 */
router.get('/:id', checkPermission('plagas', 'see'), plagaController.getPlagaById);
 
/** 
 * @route POST /api/plagas
 * @access Private
 */
router.post('/', checkPermission('plagas', 'create'), validateSchema(createPlagaSchema), plagaController.createPlaga);
 
/** 
 * @route PUT /api/plagas/:id
 * @access Private
 */
router.put('/:id', checkPermission('plagas', 'update'), validateSchema(updatePlagaSchema), plagaController.updatePlaga);
 
/** 
 * @route DELETE /api/plagas/:id
 * @access Private
 */
router.delete('/:id', checkPermission('plagas', 'delete'), plagaController.deletePlaga);
 
/** 
 * @route POST /api/plagas/bulk-delete
 * @access Private
 */
router.post('/bulk-delete', checkPermission('plagas', 'delete'), plagaController.deleteManyPlagas);

export default router;
