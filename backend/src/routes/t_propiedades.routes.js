import { Router } from 'express';
import * as tPropiedadController from '../controllers/t_propiedades.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createTPropiedadSchema, updateTPropiedadSchema } from '../controllers/t_propiedades.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { createTPropiedadSchema, updateTPropiedadSchema } from '../schemas/t_propiedades.schema.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route Get /api/t_propiedad
 * @access Private
*/
router.get('/', checkPermission('t_propiedad', 'see'), tPropiedadController.getTPropiedad);


/**
 * @route Get /api/t_propiedad/:id
 * @access Private
*/
router.get('/:id', checkPermission('t_propiedad', 'see'), tPropiedadController.getTPropiedadById);

/**
 * @route POST /api/t_propiedad
 * @access Private
*/
router.post('/', checkPermission('t_propiedad', 'create'), validateSchema(createTPropiedadSchema), tPropiedadController.createTPropiedad);

/**
 * @route PUT /api/t_propiedad
 * @access Private
*/
router.put('/:id', checkPermission('t_propiedad', 'update'), validateSchema(updateTPropiedadSchema), tPropiedadController.updateTPropiedad);

/**
 * @route DELETE /api/t_propiedad/:id
 * @access Private
*/
router.delete('/:id', checkPermission('t_propiedad', 'delete'), tPropiedadController.deleteTPropiedad);

/**
 * @route POST /api/t_propiedad/bulk-delete
 * @access Private
*/
router.post('/bulk-delete', checkPermission('t_propiedad', 'delete'), tPropiedadController.deleteManyTPropiedad);

export default router;