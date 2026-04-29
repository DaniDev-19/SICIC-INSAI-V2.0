import { Router } from 'express';
import * as empleadosController from '../controllers/empleados.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createEmpleadosSchema, updateEmpleadosSchema } from '../schemas/empleados.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

router.get('/', checkPermission('empleados', 'see'), empleadosController.getEmpleados);
router.get('/:id', checkPermission('empleados', 'see'), empleadosController.getEmpleadoById);
router.post('/', checkPermission('empleados', 'create'), validateSchema(createEmpleadosSchema), empleadosController.createEmpleado);
router.put('/:id', checkPermission('empleados', 'update'), validateSchema(updateEmpleadosSchema), empleadosController.updateEmpleado);
router.delete('/:id', checkPermission('empleados', 'delete'), empleadosController.deleteEmpleado);

export default router;
