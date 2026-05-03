import { Router } from 'express';
import * as userCtrl from '../controllers/user.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createUserSchema, updateUserSchema, assignInstanceSchema } from '../schemas/user.schema.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', userCtrl.getUsers);
router.get('/:id', userCtrl.getUserById);
router.post('/', validateSchema(createUserSchema), userCtrl.createUser);
router.put('/:id', validateSchema(updateUserSchema), userCtrl.updateUser);
router.delete('/:id', userCtrl.deleteUser);

router.post('/:id/instances', validateSchema(assignInstanceSchema), userCtrl.assignInstance);
router.delete('/:id/instances/:instancia_id', userCtrl.removeInstance);

export default router;
