import { Router } from 'express';
import * as inspeccionesController from '../controllers/inspecciones.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createInspeccionSchema, updateInspeccionSchema } from '../schemas/inspecciones.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

router.get('/', checkPermission('inspecciones', 'see'), inspeccionesController.getInspecciones);
router.get('/:id', checkPermission('inspecciones', 'see'), inspeccionesController.getInspeccionById);

router.post(
  '/',
  checkPermission('inspecciones', 'create'),
  upload.array('fotos', 10),
  validateSchema(createInspeccionSchema),
  inspeccionesController.createInspeccion
);

router.put(
  '/:id',
  checkPermission('inspecciones', 'update'),
  upload.array('fotos', 10),
  validateSchema(updateInspeccionSchema),
  inspeccionesController.updateInspeccion
);

router.delete('/:id', checkPermission('inspecciones', 'delete'), inspeccionesController.deleteInspeccion);

export default router;
