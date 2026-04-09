import { Router } from 'express';
import * as roleController from '../controllers/role.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createRoleSchema, updateRoleSchema } from '../schemas/role.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.use(protect);

/**
 * @route GET /api/roles
 * @access Private
 */
router.get('/', checkPermission('roles', 'see'), roleController.getRoles);

/**
 * @route GET /api/roles/:id
 * @access Private
 */
router.get('/:id', checkPermission('roles', 'see'), roleController.getRoleById);

/**
 * @route POST /api/roles
 * @access Private
 */
router.post('/', validateSchema(createRoleSchema), checkPermission('roles', 'create'), roleController.createRole);

/**
 * @route PATCH /api/roles/:id
 * @access Private
 */
router.patch('/:id', validateSchema(updateRoleSchema), checkPermission('roles', 'edit'), roleController.updateRole);

/**
 * @route DELETE /api/roles/:id
 * @access Private
 */
router.delete('/:id', checkPermission('roles', 'delete'), roleController.deleteRole);

export default router;
