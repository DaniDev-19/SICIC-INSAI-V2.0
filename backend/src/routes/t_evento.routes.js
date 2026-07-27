import { Router } from 'express';
import * as tEventoController from '../controllers/t_evento.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createTEventoSchema, updateTEventoSchema } from '../schemas/t_evento.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
//import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route Get /api/t_evento
 * @access Public
*/
router.get('/', tEventoController.getTEvento);


/**
 * @route Get /api/t_evento/:id
 * @access Public
*/
router.get('/:id', tEventoController.getTEventoById);

/**
 * @route POST /api/t_evento
 * @access Public
*/
router.post('/', validateSchema(createTEventoSchema), tEventoController.createTEvento);

/**
 * @route PUT /api/t_evento
 * @access Public
*/
router.put('/:id', validateSchema(updateTEventoSchema), tEventoController.updateTEvento);

/**
 * @route DELETE /api/t_evento/:id
 * @access Public
*/
router.delete('/:id', tEventoController.deleteTEvento);

/**
 * @route POST /api/t_evento/bulk-delete
 * @access Public
*/
router.post('/bulk-delete', tEventoController.deleteManyTEvento);

export default router;
