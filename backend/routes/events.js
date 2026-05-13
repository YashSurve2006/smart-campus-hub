import { Router } from 'express';
import { body, param, query as q } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import { uploadEventBanner } from '../utils/multerEventBanner.js';
import * as uploadRegistryService from '../services/uploadRegistryService.js';
import * as eventController from '../controllers/eventController.js';

const router = Router();

router.get(
  '/featured',
  authenticate,
  [q('limit').optional().isInt({ min: 1, max: 20 })],
  validate,
  eventController.featured
);

router.get('/my/registrations', authenticate, eventController.myRegistrations);

router.post(
  '/upload/banner',
  authenticate,
  requireRole('faculty', 'admin'),
  uploadLimiter,
  uploadEventBanner.single('banner'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Banner file required' });
      }
      const url = `/api/files/events/${req.file.filename}`;
      try {
        await uploadRegistryService.recordFile({
          userId: req.user.id,
          scope: 'event_banner',
          entityType: 'event_banner',
          entityId: null,
          publicPath: url,
          storedName: req.file.filename,
          originalName: req.file.originalname?.slice(0, 250) || 'banner',
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
        });
      } catch {
        /* registry optional */
      }
      res.json({ success: true, url });
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  '/',
  authenticate,
  [
    q('upcoming').optional().isIn(['0', '1']),
    q('status').optional().isIn(['upcoming', 'live', 'past']),
    q('category').optional().isIn(['academic', 'cultural', 'sports', 'career', 'general']),
    q('limit').optional().isInt({ min: 1, max: 100 }),
    q('search').optional().isString().isLength({ max: 120 }),
  ],
  validate,
  eventController.list
);

router.post(
  '/',
  authenticate,
  requireRole('faculty', 'admin'),
  [
    body('title').trim().notEmpty().isLength({ max: 255 }),
    body('description').trim().notEmpty().isLength({ max: 8000 }),
    body('category').optional().isIn(['academic', 'cultural', 'sports', 'career', 'general']),
    body('location').trim().notEmpty().isLength({ max: 255 }),
    body('startsAt').notEmpty(),
    body('endsAt').notEmpty(),
    body('targetRole').optional().isIn(['all', 'student', 'faculty']),
    body('departmentId').optional().isInt({ min: 1 }),
    body('maxAttendees').optional().isInt({ min: 1 }),
    body('isFeatured').optional().isBoolean(),
    body('bannerUrl').optional().isString().isLength({ max: 512 }),
  ],
  validate,
  eventController.create
);

router.get(
  '/:id/registrations/export',
  authenticate,
  requireRole('faculty', 'admin'),
  [param('id').isInt({ min: 1 })],
  validate,
  eventController.exportRegistrations
);

router.get(
  '/:id/registrations',
  authenticate,
  requireRole('faculty', 'admin'),
  [param('id').isInt({ min: 1 })],
  validate,
  eventController.listRegistrations
);

router.get(
  '/:id',
  authenticate,
  [param('id').isInt({ min: 1 })],
  validate,
  eventController.getOne
);

router.patch(
  '/:id',
  authenticate,
  requireRole('faculty', 'admin'),
  [param('id').isInt({ min: 1 })],
  validate,
  eventController.update
);

router.delete(
  '/:id',
  authenticate,
  requireRole('faculty', 'admin'),
  [param('id').isInt({ min: 1 })],
  validate,
  eventController.remove
);

router.post(
  '/:id/register',
  authenticate,
  requireRole('student', 'faculty'),
  [param('id').isInt({ min: 1 })],
  validate,
  eventController.register
);

router.delete(
  '/:id/register',
  authenticate,
  [param('id').isInt({ min: 1 })],
  validate,
  eventController.unregister
);

export default router;
