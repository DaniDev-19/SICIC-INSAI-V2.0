import { Router } from 'express';
import * as tProgramaController from '../controllers/t_programa.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createTProgramaSchema, updateTProgramaSchema } from '../schemas/t_programa.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
//import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route Get /api/t_programa
 * @access Public
*/
router.get('/', tProgramaController.getTPrograma);


/**
 * @route Get /api/t_programa/:id
 * @access Public
*/
router.get('/:id', tProgramaController.getTProgramaById);

/**
 * @route POST /api/t_programa
 * @access Public
*/
router.post('/', validateSchema(createTProgramaSchema), tProgramaController.createTPrograma);

/**
 * @route PUT /api/t_programa
 * @access Public
*/
router.put('/:id', validateSchema(updateTProgramaSchema), tProgramaController.updateTPrograma);

/**
 * @route DELETE /api/t_programa/:id
 * @access Public
*/
router.delete('/:id', tProgramaController.deleteTPrograma);

/**
 * @route POST /api/t_programa/bulk-delete
 * @access Public
*/
router.post('/bulk-delete', tProgramaController.deleteManyTPrograma);

export default router;
