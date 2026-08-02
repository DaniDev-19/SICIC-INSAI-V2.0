import { Router } from 'express';
import * as profesionController from '../controllers/profesion.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createProfesionSchema, updateProfesionSchema } from '../schemas/profesion.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
//import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route Get /api/profesion
 * @access Private
*/
router.get('/', profesionController.getProfesion);


/**
 * @route Get /api/profesion/:id
 * @access Private
*/
router.get('/:id', profesionController.getProfesionById);

/**
 * @route POST /api/profesion
 * @access Private
*/
router.post('/', validateSchema(createProfesionSchema), profesionController.createProfesion);

/**
 * @route PUT /api/profesion
 * @access Private
*/
router.put('/:id', validateSchema(updateProfesionSchema), profesionController.updateProfesion);

/**
 * @route DELETE /api/profesion/:id
 * @access Private
*/
router.delete('/:id', profesionController.deleteProfesion);

/**
 * @route POST /api/profesion/bulk-delete
 * @access Private
*/
router.post('/bulk-delete', profesionController.deleteManyProfesion);

export default router;
