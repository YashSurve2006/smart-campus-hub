import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { uploadAvatar } from '../utils/multerAvatar.js';
import * as userController from '../controllers/userController.js';

const router = Router();

router.use(authenticate);
router.patch(
  '/profile',
  [
    body('firstName').optional().trim().isLength({ min: 1, max: 80 }),
    body('lastName').optional().trim().isLength({ min: 1, max: 80 }),
    body('phone').optional().trim().isLength({ max: 32 }),
    body('avatarUrl').optional().isString().isLength({ max: 512 }),
    body('specialization').optional({ nullable: true }).isString().isLength({ max: 255 }),
  ],
  validate,
  userController.updateProfile
);
router.post(
  '/change-password',
  [
    body('currentPassword').isString().isLength({ min: 1 }),
    body('newPassword').isString().isLength({ min: 8 }),
  ],
  validate,
  userController.changePassword
);
router.get('/activity', userController.listActivity);
router.post(
  '/avatar',
  uploadLimiter,
  uploadAvatar.single('avatar'),
  userController.uploadAvatar
);

export default router;
