import { Router } from 'express';
import { body, param, query as q } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import * as campusController from '../controllers/campusController.js';

const router = Router();

router.get(
  '/places',
  [q('category').optional().isIn(['building', 'facility', 'landmark', 'hostel', 'sports'])],
  validate,
  campusController.listPlaces
);
router.post(
  '/places',
  authenticate,
  requireRole('admin'),
  [
    body('name').trim().notEmpty().isLength({ max: 160 }),
    body('category').optional().isIn(['building', 'facility', 'landmark', 'hostel', 'sports']),
    body('building').optional({ nullable: true }).isString().isLength({ max: 120 }),
    body('floor').optional({ nullable: true }).isString().isLength({ max: 32 }),
    body('description').optional({ nullable: true }).isString().isLength({ max: 5000 }),
  ],
  validate,
  campusController.createPlace
);
router.patch(
  '/places/:id',
  authenticate,
  requireRole('admin'),
  [param('id').isInt({ min: 1 })],
  validate,
  campusController.updatePlace
);
router.delete(
  '/places/:id',
  authenticate,
  requireRole('admin'),
  [param('id').isInt({ min: 1 })],
  validate,
  campusController.deletePlace
);

export default router;
