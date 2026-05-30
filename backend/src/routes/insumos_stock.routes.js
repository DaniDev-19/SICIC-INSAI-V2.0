import { Router } from 'express';
import * as stockCtrl from '../controllers/insumos_stock.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { manualMovementSchema } from '../schemas/insumos_stock.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

router.get('/oficina/:oficina_id', checkPermission('insumos', 'see'), stockCtrl.getStockByOficina);
router.get('/movimientos', checkPermission('insumos', 'see'), stockCtrl.getMovimientos);

router.post('/movimiento-manual',
  checkPermission('insumos', 'update'),
  validateSchema(manualMovementSchema),
  stockCtrl.registrarMovimientoManual
);

export default router;
