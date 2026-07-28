import { Router } from 'express';
import { searchGlobal } from '../controllers/search.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/global', searchGlobal);

export default router;
