import { Router } from "express";
import { validateSchema } from "../middlewares/validate.middleware.js";
import * as TSolicitudController from '../controllers/t_solicitud.controller.js';
import { createTSolicitudSchema, updateTSolicitudSchema } from '../schemas/t_solicitud.schema.js';
import { protect } from "../middlewares/auth.middleware.js";
//import { checkPermission } from "../middlewares/permission.middleware.js";
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route Get /api/t_solicitud
 * @access Public
*/
router.get('/', TSolicitudController.getTSolicitud);


/**
 * @route Get /api/t_solicitud/:id
 * @access Public
*/
router.get('/:id', TSolicitudController.getTSolicitudById);

/**
 * @route POST /api/t_solicitud
 * @access Public
*/
router.post('/', validateSchema(createTSolicitudSchema), TSolicitudController.createTSolicitud);

/**
 * @route PUT /api/t_solicitud
 * @access Public
*/
router.put('/:id', validateSchema(updateTSolicitudSchema), TSolicitudController.updateTSolicitud);

/**
 * @route DELETE /api/t_solicitud/:id
 * @access Public
*/
router.delete('/:id', TSolicitudController.deleteTSolicitud);

/**
 * @route POST /api/t_solicitud/bulk-delete
 * @access Public
*/
router.post('/bulk-delete', TSolicitudController.deleteManyTSolicitud);

export default router;

