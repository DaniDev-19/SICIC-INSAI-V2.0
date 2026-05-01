import { Router } from 'express';
import * as avalesCtrl from '../controllers/avales.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createAvalSchema } from '../schemas/avales.schema.js';
import multer from 'multer';

const router = Router();
const upload = multer();

router.get('/', avalesCtrl.getAvales);
router.get('/:id', avalesCtrl.getAvalById);

router.post('/',
  upload.array('hierros', 5),
  validateSchema(createAvalSchema),
  avalesCtrl.createAval
);

router.put('/:id',
  upload.array('hierros', 5),
  avalesCtrl.updateAval
);

router.delete('/:id', avalesCtrl.deleteAval);

export default router;
