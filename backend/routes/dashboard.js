import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = Router();

router.get('/student', authenticate, requireRole('student'), dashboardController.student);
router.get('/faculty', authenticate, requireRole('faculty'), dashboardController.faculty);
router.get('/admin', authenticate, requireRole('admin'), dashboardController.admin);

export default router;
