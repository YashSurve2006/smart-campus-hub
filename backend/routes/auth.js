import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as authController from '../controllers/authController.js';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().notEmpty().isLength({ max: 80 }),
    body('lastName').trim().notEmpty().isLength({ max: 80 }),
    body('role').isIn(['student', 'faculty']),
  ],
  validate,
  authController.register
);
router.post(
  '/login',
  [body('email').isEmail(), body('password').isString().isLength({ min: 1 })],
  validate,
  authController.login
);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
