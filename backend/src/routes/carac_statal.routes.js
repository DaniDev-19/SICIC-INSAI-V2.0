import { Router } from 'express';
import * as caracStatalController from '../controllers/carac_statal.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createCaracStatalSchema } from '../schemas/carac_statal.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

router.get('/', checkPermission('reportes', 'see'), caracStatalController.getCaracStatal);
router.get('/reporte', checkPermission('reportes', 'see'), caracStatalController.getCaracStatalReporte);
router.get('/export/excel', checkPermission('reportes', 'see'), caracStatalController.exportCaracStatalExcel);
router.get('/municipio/:municipio_id', checkPermission('reportes', 'see'), caracStatalController.getCaracStatalByMunicipio);
router.post('/', checkPermission('reportes', 'see'), validateSchema(createCaracStatalSchema), caracStatalController.createOrUpdateCaracStatal);
router.delete('/:id', checkPermission('reportes', 'see'), caracStatalController.deleteCaracStatal);

export default router;
