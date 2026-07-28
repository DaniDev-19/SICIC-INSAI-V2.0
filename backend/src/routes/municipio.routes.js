import { Router } from 'express';
import * as municipioController from '../controllers/municipio.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createMunicipioSchema, updateMunicipioSchema } from '../schemas/municipio.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
//import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route GET /api/municipios
 * @access Private
 */
router.get('/', municipioController.getMunicipios);

/**
 * @route GET /api/municipios/:id
 * @access Private
 */
router.get('/:id', municipioController.getMunicipioById);

/**
 * @route POST /api/municipios
 * @access Private
 */
router.post('/', validateSchema(createMunicipioSchema), municipioController.createMunicipio);

/**
 * @route PUT /api/municipios/:id
 * @access Private
 */
router.put('/:id', validateSchema(updateMunicipioSchema), municipioController.updateMunicipio);

/**
 * @route DELETE /api/municipios/:id
 * @access Private
 */
router.delete('/:id', municipioController.deleteMunicipio);

/**
 * @route POST /api/municipios/bulk-delete
 * @access Private
 */
router.post('/bulk-delete', municipioController.deleteManyMunicipios);

export default router;
