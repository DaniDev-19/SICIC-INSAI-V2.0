import { Router } from "express";
import { validateSchema } from "../middlewares/validate.middleware.js";
import * as TSolicitudController from '../controllers/t_solicitud.controller.js';
import { createTSolicitudSchema, updateTSolicitudSchema } from '../schemas/t_solicitud.schema.js';
import { protect } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/permission.middleware.js";
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route Get /api/t_solitud
 * @access Private
*/
router.get('/', checkPermission('t_solitud', 'see'), TSolicitudController.getTSolicitud);


/**
 * @route Get /api/t_solitud/:id
 * @access Private
*/
router.get('/:id', checkPermission('t_solitud', 'see'), TSolicitudController.getTSolicitudById);

/**
 * @route POST /api/t_solitud
 * @access Private
*/
router.post('/', checkPermission('t_solitud', 'create'), validateSchema(createTSolicitudSchema), TSolicitudController.createTSolicitud);

/**
 * @route PUT /api/t_solitud
 * @access Private
*/
router.put('/:id', checkPermission('t_solitud', 'update'), validateSchema(updateTSolicitudSchema), TSolicitudController.updateTSolicitud);

/**
 * @route DELETE /api/t_solitud/:id
 * @access Private
*/
router.delete('/:id', checkPermission('t_solitud', 'delete'), TSolicitudController.deleteTSolicitud);

/**
 * @route POST /api/t_solitud/bulk-delete
 * @access Private
*/
router.post('/bulk-delete', checkPermission('t_solitud', 'delete'), TSolicitudController.deleteManyTSolicitud);

export default router;

