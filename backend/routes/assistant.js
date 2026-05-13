import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { assistantLimiter } from '../middleware/rateLimiter.js';
import * as assistantController from '../controllers/assistantController.js';

const router = Router();

router.get('/capabilities', authenticate, assistantController.capabilities);

router.post(
  '/chat',
  authenticate,
  assistantLimiter,
  [body('message').trim().notEmpty().isLength({ min: 1, max: 2000 })],
  validate,
  assistantController.chat
);

export default router;
