import { Router } from 'express';
import * as departamentoController from '../controllers/departamento.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createDepartamentoSchema, updateDepartamentoSchema } from '../schemas/departamento.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/**
 * @route GET /api/departamentos
 * @access Private
 */
router.get('/', checkPermission('departamentos', 'see'), departamentoController.getDepartamentos);

/**
 * @route GET /api/departamentos/:id
 * @access Private
 */
router.get('/:id', checkPermission('departamentos', 'see'), departamentoController.getDepartamentoById);

/**
 * @route POST /api/departamentos
 * @access Private
 */
router.post('/', checkPermission('departamentos', 'create'), validateSchema(createDepartamentoSchema), departamentoController.createDepartamento);

/**
 * @route PUT /api/departamentos/:id
 * @access Private
 */
router.put('/:id', checkPermission('departamentos', 'update'), validateSchema(updateDepartamentoSchema), departamentoController.updateDepartamento);

/**
 * @route DELETE /api/departamentos/:id
 * @access Private
 */
router.delete('/:id', checkPermission('departamentos', 'delete'), departamentoController.deleteDepartamento);

/**
 * @route POST /api/departamentos/bulk-delete
 * @access Private
 */
router.post('/bulk-delete', checkPermission('departamentos', 'delete'), departamentoController.deleteManyDepartamentos);

export default router;
