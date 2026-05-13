import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import * as resultController from '../controllers/resultController.js';

const router = Router();

router.get(
  '/subjects',
  authenticate,
  [query('departmentId').optional().isInt({ min: 1 }), query('semester').optional().isInt({ min: 1, max: 12 })],
  validate,
  resultController.subjects
);

router.get('/student/me', authenticate, requireRole('student'), resultController.studentPortal);

router.get(
  '/faculty',
  authenticate,
  requireRole('faculty', 'admin'),
  [query('departmentId').isInt({ min: 1 }), query('semester').isInt({ min: 1, max: 12 })],
  validate,
  resultController.listFacultyEntries
);

router.post(
  '/',
  authenticate,
  requireRole('faculty', 'admin'),
  [
    body('departmentId').isInt({ min: 1 }),
    body('semester').isInt({ min: 1, max: 12 }),
    body('subjectId').isInt({ min: 1 }),
    body('examType').isIn(['internal', 'midterm', 'practical', 'endterm', 'supplementary']),
    body('rows').isArray({ min: 1 }),
    body('rows.*.studentId').isInt({ min: 1 }),
    body('rows.*.marksObtained').isFloat({ min: 0 }),
  ],
  validate,
  resultController.upsertMarks
);

router.post(
  '/publish',
  authenticate,
  requireRole('faculty', 'admin'),
  [body('departmentId').isInt({ min: 1 }), body('semester').isInt({ min: 1, max: 12 }), body('published').isBoolean()],
  validate,
  resultController.publish
);

router.post(
  '/lock',
  authenticate,
  requireRole('faculty', 'admin'),
  [body('departmentId').isInt({ min: 1 }), body('semester').isInt({ min: 1, max: 12 }), body('lock').isBoolean()],
  validate,
  resultController.lock
);

router.get(
  '/analytics',
  authenticate,
  requireRole('faculty', 'admin'),
  [query('departmentId').isInt({ min: 1 }), query('semester').isInt({ min: 1, max: 12 })],
  validate,
  resultController.analytics
);

export default router;
