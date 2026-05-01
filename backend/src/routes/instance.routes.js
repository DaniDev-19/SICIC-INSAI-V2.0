import { Router } from 'express';
import * as instCtrl from '../controllers/instance.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createInstanceSchema, updateInstanceSchema } from '../schemas/instance.schema.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', instCtrl.getInstances);
router.get('/:id', instCtrl.getInstanceById);
router.post('/', validateSchema(createInstanceSchema), instCtrl.createInstance);
router.put('/:id', validateSchema(updateInstanceSchema), instCtrl.updateInstance);
router.delete('/:id', instCtrl.deleteInstance);

export default router;
