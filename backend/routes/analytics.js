import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import * as analyticsController from '../controllers/analyticsController.js';

const router = Router();

router.get('/', authenticate, requireRole('admin'), analyticsController.overview);

export default router;
