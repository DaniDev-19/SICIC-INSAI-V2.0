import { Router } from 'express';
import * as cultivoController from '../controllers/cultivo.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createCultivoSchema, updateCultivoSchema } from '../schemas/cultivo.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/** 
 * @route GET /api/cultivos
 * @access Private
 */
router.get('/', checkPermission('cultivos', 'see'), cultivoController.getCultivos);
 
/** 
 * @route GET /api/cultivos/:id
 * @access Private
 */
router.get('/:id', checkPermission('cultivos', 'see'), cultivoController.getCultivoById);
 
/** 
 * @route POST /api/cultivos
 * @access Private
 */
router.post('/', checkPermission('cultivos', 'create'), validateSchema(createCultivoSchema), cultivoController.createCultivo);
 
/** 
 * @route PUT /api/cultivos/:id
 * @access Private
 */
router.put('/:id', checkPermission('cultivos', 'update'), validateSchema(updateCultivoSchema), cultivoController.updateCultivo);
 
/** 
 * @route DELETE /api/cultivos/:id
 * @access Private
 */
router.delete('/:id', checkPermission('cultivos', 'delete'), cultivoController.deleteCultivo);
 
/** 
 * @route POST /api/cultivos/bulk-delete
 * @access Private
 */
router.post('/bulk-delete', checkPermission('cultivos', 'delete'), cultivoController.deleteManyCultivos);

export default router;
