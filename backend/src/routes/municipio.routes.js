import { Router } from 'express';
import * as municipioController from '../controllers/municipio.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createMunicipioSchema, updateMunicipioSchema } from '../schemas/municipio.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route GET /api/municipios
 * @access Private
 */
router.get('/', checkPermission('municipios', 'see'), municipioController.getMunicipios);

/**
 * @route GET /api/municipios/:id
 * @access Private
 */
router.get('/:id', checkPermission('municipios', 'see'), municipioController.getMunicipioById);

/**
 * @route POST /api/municipios
 * @access Private
 */
router.post('/', checkPermission('municipios', 'create'), validateSchema(createMunicipioSchema), municipioController.createMunicipio);

/**
 * @route PUT /api/municipios/:id
 * @access Private
 */
router.put('/:id', checkPermission('municipios', 'update'), validateSchema(updateMunicipioSchema), municipioController.updateMunicipio);

/**
 * @route DELETE /api/municipios/:id
 * @access Private
 */
router.delete('/:id', checkPermission('municipios', 'delete'), municipioController.deleteMunicipio);

/**
 * @route POST /api/municipios/bulk-delete
 * @access Private
 */
router.post('/bulk-delete', checkPermission('municipios', 'delete'), municipioController.deleteManyMunicipios);

export default router;
