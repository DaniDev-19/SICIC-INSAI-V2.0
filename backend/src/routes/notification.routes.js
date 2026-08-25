import { Router } from 'express';
import * as notificationCtrl from '../controllers/notification.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import {
  createNotificationSchema,
  queryNotificationSchema,
  notificationIdParamSchema,
} from '../schemas/notification.schema.js';

const router = Router();

// Todas las rutas de notificaciones requieren autenticación y contexto de inquilino (tenant)
router.use(protect);
router.use(tenantMiddleware);

router.get('/', validateSchema(queryNotificationSchema), notificationCtrl.getNotificaciones);
router.get('/unread-count', notificationCtrl.getUnreadCount);
router.patch('/read-all', notificationCtrl.markAllAsRead);
router.patch('/:id/read', validateSchema(notificationIdParamSchema), notificationCtrl.markAsRead);
router.delete('/:id', validateSchema(notificationIdParamSchema), notificationCtrl.deleteNotification);

// Crear notificación manual (opcional para pruebas o administradores)
router.post('/', validateSchema(createNotificationSchema), notificationCtrl.createNotification);

export default router;
