import { Router } from 'express';
import * as userCtrl from '../controllers/user.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  assignInstanceSchema,
} from '../schemas/user.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';

const router = Router();

router.use(protect);

router.get('/', checkPermission('usuarios', 'see'), userCtrl.getUsers);
router.get('/:id', checkPermission('usuarios', 'see'), userCtrl.getUserById);
router.post('/', validateSchema(createUserSchema), checkPermission('usuarios', 'create'), userCtrl.createUser);
router.put('/:id', validateSchema(updateUserSchema), checkPermission('usuarios', 'edit'), userCtrl.updateUser);
router.patch('/:id/status', validateSchema(updateUserStatusSchema), checkPermission('usuarios', 'disable'), userCtrl.updateUserStatus);
router.delete('/:id', checkPermission('usuarios', 'delete'), userCtrl.deleteUser);

router.post(
  '/:id/instances',
  validateSchema(assignInstanceSchema),
  checkPermission('usuarios', 'edit'),
  userCtrl.assignInstance
);
router.delete('/:id/instances/:instancia_id', checkPermission('usuarios', 'edit'), userCtrl.removeInstance);

export default router;
