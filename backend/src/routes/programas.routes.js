import { Router } from 'express';
import * as programasController from '../controllers/programas.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createProgramasSchema, updateProgramasSchema } from '../schemas/programas.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

router.get('/', checkPermission('programas', 'see'), programasController.getProgramas);
router.get('/:id', checkPermission('programas', 'see'), programasController.getProgramaById);
router.post('/', checkPermission('programas', 'create'), validateSchema(createProgramasSchema), programasController.createPrograma);
router.put('/:id', checkPermission('programas', 'update'), validateSchema(updateProgramasSchema), programasController.updatePrograma);
router.delete('/:id', checkPermission('programas', 'delete'), programasController.deletePrograma);
router.post('/bulk-delete', checkPermission('programas', 'delete'), programasController.deleteManyProgramas);

export default router;
