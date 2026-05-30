import { Router } from 'express';
import * as avalesCtrl from '../controllers/avales.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createAvalSchema } from '../schemas/avales.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import multer from 'multer';

const router = Router();
const upload = multer();

router.use(protect);
router.use(tenantMiddleware);

router.get('/', checkPermission('avales', 'see'), avalesCtrl.getAvales);
router.get('/:id', checkPermission('avales', 'see'), avalesCtrl.getAvalById);

router.post('/',
  checkPermission('avales', 'create'),
  upload.array('hierros', 5),
  validateSchema(createAvalSchema),
  avalesCtrl.createAval
);

router.put('/:id',
  checkPermission('avales', 'update'),
  upload.array('hierros', 5),
  avalesCtrl.updateAval
);

router.delete('/:id', checkPermission('avales', 'delete'), avalesCtrl.deleteAval);

export default router;
