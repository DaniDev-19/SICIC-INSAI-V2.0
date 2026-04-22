import { Router } from 'express';
import * as profesionController from '../controllers/profesion.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createProfesionSchema, updateProfesionSchema } from '../schemas/profesion.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware';

const router = Router();

router.use(protect);

/**
 * @route Get /api/profesion
 * @access Private
*/
router.get('/', checkPermission('profesion', 'see'), profesionController.getProfesion);


/**
 * @route Get /api/profesion/:id
 * @access Private
*/
router.get('/:id', checkPermission('profesion', 'see'), profesionController.getProfesionById);

/**
 * @route POST /api/profesion
 * @access Private
*/
router.post('/', checkPermission('profesion', 'create'), validateSchema(createProfesionSchema), profesionController.createProfesion);

/**
 * @route PUT /api/profesion
 * @access Private
*/
router.put('/:id', checkPermission('profesion', 'update'), validateSchema(updateProfesionSchema), profesionController.updateProfesion);

/**
 * @route DELETE /api/profesion/:id
 * @access Private
*/
router.delete(':id', checkPermission('profesion', 'delete'), profesionController.deleteProfesion);

/**
 * @route POST /api/profesion/bulk-delete
 * @access Private
*/
router.post('/bulk-delete', checkPermission('profesion', 'delete'), profesionController.deleteManyProfesion);

export default router;