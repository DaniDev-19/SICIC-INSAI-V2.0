import { Router } from 'express';
import * as animalController from '../controllers/animal.controller.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createAnimalSchema, updateAnimalSchema } from '../schemas/animal.schema.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

/** 
 * @route GET /api/animales
 * @access Private
 */
router.get('/', checkPermission('animales', 'see'), animalController.getAnimales);
 
/** 
 * @route GET /api/animales/:id
 * @access Private
 */
router.get('/:id', checkPermission('animales', 'see'), animalController.getAnimalById);
 
/** 
 * @route POST /api/animales
 * @access Private
 */
router.post('/', checkPermission('animales', 'create'), validateSchema(createAnimalSchema), animalController.createAnimal);
 
/** 
 * @route PUT /api/animales/:id
 * @access Private
 */
router.put('/:id', checkPermission('animales', 'update'), validateSchema(updateAnimalSchema), animalController.updateAnimal);
 
/** 
 * @route DELETE /api/animales/:id
 * @access Private
 */
router.delete('/:id', checkPermission('animales', 'delete'), animalController.deleteAnimal);
 
/** 
 * @route POST /api/animales/bulk-delete
 * @access Private
 */
router.post('/bulk-delete', checkPermission('animales', 'delete'), animalController.deleteManyAnimales);

export default router;
