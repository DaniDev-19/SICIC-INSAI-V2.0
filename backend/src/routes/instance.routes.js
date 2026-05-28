import { Router } from 'express';
import * as instCtrl from '../controllers/instance.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import {
  createInstanceSchema,
  updateInstanceSchema,
  updateInstanceStatusSchema,
} from '../schemas/instance.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.use(protect);

router.get('/', checkPermission('instancias', 'see'), instCtrl.getInstances);
router.get('/:id', checkPermission('instancias', 'see'), instCtrl.getInstanceById);
router.post('/', validateSchema(createInstanceSchema), checkPermission('instancias', 'create'), instCtrl.createInstance);
router.put('/:id', validateSchema(updateInstanceSchema), checkPermission('instancias', 'edit'), instCtrl.updateInstance);
router.patch('/:id/status', validateSchema(updateInstanceStatusSchema), checkPermission('instancias', 'disable'), instCtrl.updateInstanceStatus);
router.delete('/:id', checkPermission('instancias', 'delete'), instCtrl.deleteInstance);

export default router;
