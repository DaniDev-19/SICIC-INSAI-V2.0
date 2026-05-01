import { Router } from 'express';
import * as actaSilosController from '../controllers/acta_silos.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createActaSiloSchema, updateActaSiloSchema } from '../schemas/acta_silos.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

router.get('/', checkPermission('acta_silos', 'see'), actaSilosController.getActaSilos);
router.get('/:id', checkPermission('acta_silos', 'see'), actaSilosController.getActaSiloById);

router.post(
  '/',
  checkPermission('acta_silos', 'create'),
  upload.array('fotos', 5),
  validateSchema(createActaSiloSchema),
  actaSilosController.createActaSilo
);

router.put(
  '/:id',
  checkPermission('acta_silos', 'update'),
  upload.array('fotos', 5),
  validateSchema(updateActaSiloSchema),
  actaSilosController.updateActaSilo
);

router.delete('/:id', checkPermission('acta_silos', 'delete'), actaSilosController.deleteActaSilo);

export default router;
