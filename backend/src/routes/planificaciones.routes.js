import { Router } from 'express';
import * as planificacionesController from '../controllers/planificaciones.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createPlanificacionSchema, updatePlanificacionSchema } from '../schemas/planificaciones.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

router.get('/', checkPermission('planificaciones', 'see'), planificacionesController.getPlanificaciones);
router.get('/:id', checkPermission('planificaciones', 'see'), planificacionesController.getPlanificacionById);
router.post('/', checkPermission('planificaciones', 'create'), validateSchema(createPlanificacionSchema), planificacionesController.createPlanificacion);
router.put('/:id', checkPermission('planificaciones', 'update'), validateSchema(updatePlanificacionSchema), planificacionesController.updatePlanificacion);
router.delete('/:id', checkPermission('planificaciones', 'delete'), planificacionesController.deletePlanificacion);

export default router;
