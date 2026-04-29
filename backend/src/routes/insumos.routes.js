import { Router } from 'express';
import * as insumosController from '../controllers/insumos.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createInsumosSchema, updateInsumosSchema } from '../schemas/insumos.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

router.get('/', checkPermission('insumos', 'see'), insumosController.getInsumos);
router.get('/:id', checkPermission('insumos', 'see'), insumosController.getInsumoById);
router.post('/', checkPermission('insumos', 'create'), validateSchema(createInsumosSchema), insumosController.createInsumo);
router.put('/:id', checkPermission('insumos', 'update'), validateSchema(updateInsumosSchema), insumosController.updateInsumo);
router.delete('/:id', checkPermission('insumos', 'delete'), insumosController.deleteInsumo);
router.post('/bulk-delete', checkPermission('insumos', 'delete'), insumosController.deleteManyInsumos);

export default router;
