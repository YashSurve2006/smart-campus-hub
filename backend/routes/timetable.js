import { Router } from 'express';
import { body, param, query as q } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import * as timetableController from '../controllers/timetableController.js';

const router = Router();

router.get(
  '/',
  authenticate,
  [
    q('departmentId').optional().isInt({ min: 1 }),
    q('semester').optional().isInt({ min: 1, max: 12 }),
    q('dayOfWeek').optional().isInt({ min: 1, max: 7 }),
    q('mine').optional().isIn(['0', '1']),
  ],
  validate,
  timetableController.list
);
router.post(
  '/',
  authenticate,
  requireRole('faculty', 'admin'),
  [
    body('departmentId').isInt({ min: 1 }),
    body('semester').isInt({ min: 1, max: 12 }),
    body('dayOfWeek').isInt({ min: 1, max: 7 }),
    body('startTime').matches(/^\d{2}:\d{2}(:\d{2})?$/),
    body('endTime').matches(/^\d{2}:\d{2}(:\d{2})?$/),
    body('subjectName').trim().notEmpty().isLength({ max: 160 }),
    body('classroomId').isInt({ min: 1 }),
    body('facultyId').optional().isInt({ min: 1 }),
    body('section').optional({ nullable: true }).isString().isLength({ max: 32 }),
  ],
  validate,
  timetableController.create
);
router.patch(
  '/:id',
  authenticate,
  requireRole('faculty', 'admin'),
  [param('id').isInt({ min: 1 })],
  validate,
  timetableController.update
);
router.delete(
  '/:id',
  authenticate,
  requireRole('faculty', 'admin'),
  [param('id').isInt({ min: 1 })],
  validate,
  timetableController.remove
);

export default router;
