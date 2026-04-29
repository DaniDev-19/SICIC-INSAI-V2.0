import { Router } from 'express';
import * as propiedadesController from '../controllers/propiedades.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createPropiedadesSchema, updatePropiedadesSchema } from '../schemas/propiedades.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

router.get('/', checkPermission('propiedades', 'see'), propiedadesController.getPropiedades);
router.get('/export', checkPermission('propiedades', 'export'), propiedadesController.exportPropiedades);
router.get('/:id', checkPermission('propiedades', 'see'), propiedadesController.getPropiedadById);
router.post('/', checkPermission('propiedades', 'create'), upload.single('hierro_img'), validateSchema(createPropiedadesSchema), propiedadesController.createPropiedad);
router.put('/:id', checkPermission('propiedades', 'update'), upload.single('hierro_img'), validateSchema(updatePropiedadesSchema), propiedadesController.updatePropiedad);
router.delete('/:id', checkPermission('propiedades', 'delete'), propiedadesController.deletePropiedad);

export default router;
