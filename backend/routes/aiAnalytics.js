/**
 * AI Analytics Routes
 * ───────────────────
 * All routes are under /api/ai-analytics (mounted in server.js).
 * Protected by existing authenticate + requireRole middleware.
 * Zero changes to existing result routes.
 */

import { Router } from 'express';
import { query as validQuery, body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import * as ctrl from '../controllers/aiAnalyticsController.js';

const router = Router();

/* ------------------------------------------------------------------ */
/* STUDENT ROUTES                                                        */
/* ------------------------------------------------------------------ */

// GET /api/ai-analytics/student/insights
router.get('/student/insights', authenticate, requireRole('student'), ctrl.studentInsights);

/* ------------------------------------------------------------------ */
/* FACULTY + ADMIN ROUTES                                               */
/* ------------------------------------------------------------------ */

const deptSemValidation = [
  validQuery('departmentId').isInt({ min: 1 }).withMessage('Valid departmentId required'),
  validQuery('semester').isInt({ min: 1, max: 12 }).withMessage('Valid semester (1–12) required'),
];

// GET /api/ai-analytics/faculty/moderation
router.get(
  '/faculty/moderation',
  authenticate,
  requireRole('faculty', 'admin'),
  deptSemValidation,
  validate,
  ctrl.facultyModeration
);

// GET /api/ai-analytics/faculty/anomalies
router.get(
  '/faculty/anomalies',
  authenticate,
  requireRole('faculty', 'admin'),
  deptSemValidation,
  validate,
  ctrl.facultyAnomalies
);

// GET /api/ai-analytics/faculty/subject-difficulty
router.get(
  '/faculty/subject-difficulty',
  authenticate,
  requireRole('faculty', 'admin'),
  deptSemValidation,
  validate,
  ctrl.subjectDifficulty
);

// GET /api/ai-analytics/faculty/failure-matrix
router.get(
  '/faculty/failure-matrix',
  authenticate,
  requireRole('faculty', 'admin'),
  deptSemValidation,
  validate,
  ctrl.failureMatrix
);

/* ------------------------------------------------------------------ */
/* ADMIN ROUTES                                                          */
/* ------------------------------------------------------------------ */

// GET /api/ai-analytics/admin/overview
router.get('/admin/overview', authenticate, requireRole('admin'), ctrl.adminOverview);

// GET /api/ai-analytics/admin/department-rankings
router.get('/admin/department-rankings', authenticate, requireRole('admin'), ctrl.departmentRankings);

// GET /api/ai-analytics/admin/risk-students
router.get(
  '/admin/risk-students',
  authenticate,
  requireRole('admin'),
  [
    validQuery('departmentId').optional().isInt({ min: 1 }),
    validQuery('semester').optional().isInt({ min: 1, max: 12 }),
    validQuery('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  ctrl.riskStudents
);

// GET /api/ai-analytics/admin/heatmap
router.get(
  '/admin/heatmap',
  authenticate,
  requireRole('admin'),
  [
    validQuery('departmentId').optional().isInt({ min: 1 }),
    validQuery('semester').optional().isInt({ min: 1, max: 12 }),
  ],
  validate,
  ctrl.subjectHeatmap
);

// GET /api/ai-analytics/admin/toppers
router.get(
  '/admin/toppers',
  authenticate,
  requireRole('admin'),
  [
    validQuery('departmentId').optional().isInt({ min: 1 }),
    validQuery('semester').optional().isInt({ min: 1, max: 12 }),
    validQuery('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  ctrl.toppersList
);

// GET /api/ai-analytics/admin/cgpa-spikes
router.get(
  '/admin/cgpa-spikes',
  authenticate,
  requireRole('admin'),
  [validQuery('departmentId').isInt({ min: 1 })],
  validate,
  ctrl.cgpaSpikes
);

/* ------------------------------------------------------------------ */
/* REPORT ROUTES                                                         */
/* ------------------------------------------------------------------ */

// POST /api/ai-analytics/report/generate
router.post(
  '/report/generate',
  authenticate,
  requireRole('faculty', 'admin'),
  [
    body('departmentId').isInt({ min: 1 }),
    body('semester').isInt({ min: 1, max: 12 }),
    body('type').optional().isIn(['moderation', 'summary']),
  ],
  validate,
  ctrl.generateReport
);

export default router;
