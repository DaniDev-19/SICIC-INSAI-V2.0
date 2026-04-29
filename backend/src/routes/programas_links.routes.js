import { Router } from 'express';
import * as linksController from '../controllers/programas_links.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { bulkLinkProgramaSchema } from '../schemas/programas_links.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

// Plagas
router.post('/plagas', checkPermission('programas', 'update'), validateSchema(bulkLinkProgramaSchema), linksController.linkPlagas);
router.delete('/plagas/:id', checkPermission('programas', 'update'), linksController.unlinkPlaga);

// Cultivos
router.post('/cultivos', checkPermission('programas', 'update'), validateSchema(bulkLinkProgramaSchema), linksController.linkCultivos);
router.delete('/cultivos/:id', checkPermission('programas', 'update'), linksController.unlinkCultivo);

// Animales
router.post('/animales', checkPermission('programas', 'update'), validateSchema(bulkLinkProgramaSchema), linksController.linkAnimales);
router.delete('/animales/:id', checkPermission('programas', 'update'), linksController.unlinkAnimal);

// Enfermedades
router.post('/enfermedades', checkPermission('programas', 'update'), validateSchema(bulkLinkProgramaSchema), linksController.linkEnfermedades);
router.delete('/enfermedades/:id', checkPermission('programas', 'update'), linksController.unlinkEnfermedad);

export default router;
