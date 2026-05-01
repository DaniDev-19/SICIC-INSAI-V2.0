import { Router } from 'express';
import * as solicitudesController from '../controllers/solicitudes.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createSolicitudSchema, updateSolicitudSchema } from '../schemas/solicitudes.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

router.get('/', checkPermission('solicitudes', 'see'), solicitudesController.getSolicitudes);
router.get('/:id', checkPermission('solicitudes', 'see'), solicitudesController.getSolicitudById);
router.post('/', checkPermission('solicitudes', 'create'), validateSchema(createSolicitudSchema), solicitudesController.createSolicitud);
router.put('/:id', checkPermission('solicitudes', 'update'), validateSchema(updateSolicitudSchema), solicitudesController.updateSolicitud);
router.delete('/:id', checkPermission('solicitudes', 'delete'), solicitudesController.deleteSolicitud);

export default router;
