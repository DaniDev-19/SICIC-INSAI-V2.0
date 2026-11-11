import { Router } from 'express';
import { getPlantillas, sendComunicado, sendFeedbackEmail } from '../controllers/mail.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

router.get('/plantillas', getPlantillas);
router.post('/send-comunicado', sendComunicado);
router.post('/feedback', sendFeedbackEmail);

export default router;
