import { Router } from 'express';
import * as tEventoController from '../controllers/t_evento.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createTEventoSchema, updateTEventoSchema } from '../schemas/t_evento.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route Get /api/t_evento
 * @access Private
*/
router.get('/', checkPermission('t_evento', 'see'), tEventoController.getTEvento);


/**
 * @route Get /api/t_evento/:id
 * @access Private
*/
router.get('/:id', checkPermission('t_evento', 'see'), tEventoController.getTEventoById);

/**
 * @route POST /api/t_evento
 * @access Private
*/
router.post('/', checkPermission('t_evento', 'create'), validateSchema(createTEventoSchema), tEventoController.createTEvento);

/**
 * @route PUT /api/t_evento
 * @access Private
*/
router.put('/:id', checkPermission('t_evento', 'update'), validateSchema(updateTEventoSchema), tEventoController.updateTEvento);

/**
 * @route DELETE /api/t_evento/:id
 * @access Private
*/
router.delete('/:id', checkPermission('t_evento', 'delete'), tEventoController.deleteTEvento);

/**
 * @route POST /api/t_evento/bulk-delete
 * @access Private
*/
router.post('/bulk-delete', checkPermission('t_evento', 'delete'), tEventoController.deleteManyTEvento);

export default router;