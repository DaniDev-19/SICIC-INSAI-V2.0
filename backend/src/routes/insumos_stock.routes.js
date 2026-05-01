import { Router } from 'express';
import * as stockCtrl from '../controllers/insumos_stock.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { manualMovementSchema } from '../schemas/insumos_stock.schema.js';

const router = Router();

router.get('/oficina/:oficina_id', stockCtrl.getStockByOficina);
router.get('/movimientos', stockCtrl.getMovimientos);

router.post('/movimiento-manual', 
  validateSchema(manualMovementSchema), 
  stockCtrl.registrarMovimientoManual
);

export default router;
