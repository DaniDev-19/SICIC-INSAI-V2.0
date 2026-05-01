import { Router } from 'express';
import * as avalesCtrl from '../controllers/avales.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createAvalSchema } from '../schemas/avales.schema.js';
import multer from 'multer';

const router = Router();
const upload = multer(); // Para manejar multipart/form-data (hierros y JSON)

router.get('/', avalesCtrl.getAvales);
router.get('/:id', avalesCtrl.getAvalById);

router.post('/', 
  upload.array('hierros', 5), // Hasta 5 imágenes de hierros
  validateSchema(createAvalSchema), 
  avalesCtrl.createAval
);

export default router;
