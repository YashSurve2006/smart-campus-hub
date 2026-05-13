import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import * as attendanceController from '../controllers/attendanceController.js';

const router = Router();

router.get('/me/summary', authenticate, requireRole('student'), attendanceController.mySummary);
router.get('/me', authenticate, requireRole('student'), attendanceController.myRecords);
router.get(
  '/roster/:timetableId',
  authenticate,
  requireRole('faculty', 'admin'),
  [param('timetableId').isInt({ min: 1 })],
  validate,
  attendanceController.roster
);
router.post(
  '/mark',
  authenticate,
  requireRole('faculty', 'admin'),
  [
    body('timetableEntryId').isInt({ min: 1 }),
    body('attendanceDate').isISO8601(),
    body('records').isArray({ min: 1 }),
    body('records.*.studentId').isInt({ min: 1 }),
    body('records.*.status').isIn(['present', 'absent', 'late']),
  ],
  validate,
  attendanceController.mark
);

export default router;
