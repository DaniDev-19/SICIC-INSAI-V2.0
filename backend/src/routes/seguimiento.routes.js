import { Router } from 'express';
import * as seguimientoController from '../controllers/seguimiento.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createSeguimientoSchema, updateSeguimientoSchema } from '../schemas/seguimiento.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

router.get('/', checkPermission('seguimientos', 'see'), seguimientoController.getSeguimientos);
router.get('/:id', checkPermission('seguimientos', 'see'), seguimientoController.getSeguimientoById);

router.post(
  '/',
  checkPermission('seguimientos', 'create'),
  upload.array('fotos', 5),
  validateSchema(createSeguimientoSchema),
  seguimientoController.createSeguimiento
);

router.put(
  '/:id',
  checkPermission('seguimientos', 'update'),
  upload.array('fotos', 5),
  validateSchema(updateSeguimientoSchema),
  seguimientoController.updateSeguimiento
);

router.delete('/:id', checkPermission('seguimientos', 'delete'), seguimientoController.deleteSeguimiento);

export default router;
