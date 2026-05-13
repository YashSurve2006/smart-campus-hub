import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { param } from 'express-validator';
import { validate } from '../middleware/validate.js';
import * as fileRegistryController from '../controllers/fileRegistryController.js';

const router = Router();

router.use(authenticate);

router.get('/me', fileRegistryController.myFiles);
router.get('/me/stats', fileRegistryController.myStats);
router.delete(
  '/me/:id',
  [param('id').isInt({ min: 1 })],
  validate,
  fileRegistryController.removeMine
);

router.get('/admin/all', requireRole('admin'), fileRegistryController.adminAll);
router.get('/admin/stats', requireRole('admin'), fileRegistryController.adminStats);

export default router;
