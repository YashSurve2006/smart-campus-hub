import { Router } from 'express';
import { param } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as notificationController from '../controllers/notificationController.js';

const router = Router();

router.use(authenticate);
router.get('/', notificationController.listMine);
router.post('/read-all', notificationController.readAll);
router.post('/:id/read', [param('id').isInt({ min: 1 })], validate, notificationController.readOne);

export default router;
