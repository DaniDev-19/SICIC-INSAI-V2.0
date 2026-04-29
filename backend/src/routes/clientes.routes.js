import { Router } from 'express';
import * as clientesController from '../controllers/clientes.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createClientesSchema, updateClientesSchema } from '../schemas/clientes.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

router.get('/', checkPermission('clientes', 'see'), clientesController.getClientes);
router.get('/export', checkPermission('clientes', 'export'), clientesController.exportClientes);
router.get('/:id', checkPermission('clientes', 'see'), clientesController.getClienteById);
router.post('/', checkPermission('clientes', 'create'), validateSchema(createClientesSchema), clientesController.createCliente);
router.put('/:id', checkPermission('clientes', 'update'), validateSchema(updateClientesSchema), clientesController.updateCliente);
router.delete('/:id', checkPermission('clientes', 'delete'), clientesController.deleteCliente);

export default router;
