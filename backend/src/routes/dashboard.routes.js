import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { getDashboardStats } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/stats', protect, getDashboardStats);

export default router;
