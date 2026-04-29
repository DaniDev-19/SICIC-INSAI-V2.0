import { Router } from 'express';
import * as tProgramaController from '../controllers/t_programa.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createTProgramaSchema, updateTProgramaSchema } from '../schemas/t_programa.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route Get /api/t_programa
 * @access Private
*/
router.get('/', checkPermission('t_programa', 'see'), tProgramaController.getTPrograma);


/**
 * @route Get /api/t_programa/:id
 * @access Private
*/
router.get('/:id', checkPermission('t_programa', 'see'), tProgramaController.getTProgramaById);

/**
 * @route POST /api/t_programa
 * @access Private
*/
router.post('/', checkPermission('t_programa', 'create'), validateSchema(createTProgramaSchema), tProgramaController.createTPrograma);

/**
 * @route PUT /api/t_programa
 * @access Private
*/
router.put('/:id', checkPermission('t_programa', 'update'), validateSchema(updateTProgramaSchema), tProgramaController.updateTPrograma);

/**
 * @route DELETE /api/t_programa/:id
 * @access Private
*/
router.delete('/:id', checkPermission('t_programa', 'delete'), tProgramaController.deleteTPrograma);

/**
 * @route POST /api/t_programa/bulk-delete
 * @access Private
*/
router.post('/bulk-delete', checkPermission('t_programa', 'delete'), tProgramaController.deleteManyTPrograma);

export default router;