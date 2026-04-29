import { Router } from 'express';
import * as vehiculosController from '../controllers/vehiculos.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createVehiculosSchema, updateVehiculosSchema } from '../schemas/vehiculos.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

router.get('/', checkPermission('vehiculos', 'see'), vehiculosController.getVehiculos);
router.get('/:id', checkPermission('vehiculos', 'see'), vehiculosController.getVehiculoById);
router.post('/', checkPermission('vehiculos', 'create'), validateSchema(createVehiculosSchema), vehiculosController.createVehiculo);
router.put('/:id', checkPermission('vehiculos', 'update'), validateSchema(updateVehiculosSchema), vehiculosController.updateVehiculo);
router.delete('/:id', checkPermission('vehiculos', 'delete'), vehiculosController.deleteVehiculo);
router.post('/bulk-delete', checkPermission('vehiculos', 'delete'), vehiculosController.deleteManyVehiculos);

export default router;
