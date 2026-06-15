import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { uploadAssignmentFiles } from '../utils/multerAssignment.js';
import { uploadSubmissionFiles } from '../utils/multerSubmission.js';
import * as assignmentController from '../controllers/assignmentController.js';

const router = Router();

// Common validators
const idValidator = param('id').isInt({ min: 1 });
const submissionIdValidator = param('submissionId').isInt({ min: 1 });

// Base assignment routes
router.get(
    '/',
    authenticate,
    [
        query('departmentId').optional().isInt({ min: 1 }),
        query('semester').optional().isInt({ min: 1, max: 12 }),
        query('subjectId').optional().isInt({ min: 1 }),
        query('status').optional().isIn(['draft', 'published', 'active', 'expired', 'closed']),
        query('search').optional().isString(),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('offset').optional().isInt({ min: 0 }),
    ],
    validate,
    assignmentController.getMany
);

router.post(
    '/',
    authenticate,
    requireRole('faculty', 'admin'),
    [
        body('title').isString().trim().isLength({ min: 3, max: 255 }),
        body('description').isString().trim().isLength({ min: 10 }),
        body('subjectId').isInt({ min: 1 }),
        body('departmentId').isInt({ min: 1 }),
        body('semester').isInt({ min: 1, max: 12 }),
        body('dueDate').customSanitizer(v => v === '' ? undefined : v).isISO8601(),
        body('maxMarks').optional().customSanitizer(v => v === '' ? undefined : v).isInt({ min: 1, max: 1000 }),
        body('allowLateSubmissions').optional().isBoolean(),
        body('latePenaltyPercent').optional().customSanitizer(v => v === '' ? undefined : v).isFloat({ min: 0, max: 100 }),
    ],
    validate,
    assignmentController.create
);

router.get(
    '/:id',
    authenticate,
    [idValidator],
    validate,
    assignmentController.getOne
);

router.patch(
    '/:id',
    authenticate,
    requireRole('faculty', 'admin'),
    [
        idValidator,
        body('title').optional().isString().trim().isLength({ min: 3, max: 255 }),
        body('description').optional().isString().trim().isLength({ min: 10 }),
        body('subjectId').optional().isInt({ min: 1 }),
        body('dueDate').optional().customSanitizer(v => v === '' ? undefined : v).isISO8601(),
        body('maxMarks').optional().customSanitizer(v => v === '' ? undefined : v).isInt({ min: 1, max: 1000 }),
        body('allowLateSubmissions').optional().isBoolean(),
        body('latePenaltyPercent').optional().customSanitizer(v => v === '' ? undefined : v).isFloat({ min: 0, max: 100 }),
    ],
    validate,
    assignmentController.update
);

router.delete(
    '/:id',
    authenticate,
    requireRole('faculty', 'admin'),
    [idValidator],
    validate,
    assignmentController.remove
);

router.post(
    '/:id/publish',
    authenticate,
    requireRole('faculty', 'admin'),
    [
        idValidator,
        body('published').isBoolean(),
    ],
    validate,
    assignmentController.publish
);

router.post(
    '/:id/close',
    authenticate,
    requireRole('faculty', 'admin'),
    [idValidator],
    validate,
    assignmentController.close
);

// Assignment attachments routes
router.post(
    '/:id/attachments',
    authenticate,
    requireRole('faculty', 'admin'),
    [idValidator],
    validate,
    uploadAssignmentFiles.array('files', 8),
    assignmentController.uploadAssignmentFiles
);

router.delete(
    '/:id/attachments/:attachmentId',
    authenticate,
    requireRole('faculty', 'admin'),
    [idValidator, param('attachmentId').isInt({ min: 1 })],
    validate,
    assignmentController.deleteAssignmentFile
);

// Student submission routes
router.post(
    '/:id/submit',
    authenticate,
    requireRole('student'),
    [idValidator],
    validate,
    uploadSubmissionFiles.array('files', 5),
    assignmentController.submit
);

router.post(
    '/:id/resubmit',
    authenticate,
    requireRole('student'),
    [idValidator],
    validate,
    uploadSubmissionFiles.array('files', 5),
    assignmentController.resubmit
);

router.get(
    '/:id/submission',
    authenticate,
    requireRole('student'),
    [idValidator],
    validate,
    assignmentController.getMySubmission
);

// Faculty submission routes
router.get(
    '/:id/submissions',
    authenticate,
    requireRole('faculty', 'admin'),
    [idValidator],
    validate,
    assignmentController.getSubmissions
);

router.get(
    '/submissions/:submissionId',
    authenticate,
    requireRole('faculty', 'admin'),
    [submissionIdValidator],
    validate,
    assignmentController.getSubmission
);

router.patch(
    '/submissions/:submissionId/grade',
    authenticate,
    requireRole('faculty', 'admin'),
    [
        submissionIdValidator,
        body('marksObtained').isFloat({ min: 0 }),
        body('remarks').optional().isString().trim().isLength({ max: 1000 }),
    ],
    validate,
    assignmentController.gradeSubmission
);

// Analytics
router.get(
    '/analytics',
    authenticate,
    requireRole('faculty', 'admin'),
    [
        query('departmentId').optional().isInt({ min: 1 }),
        query('semester').optional().isInt({ min: 1, max: 12 }),
        query('assignmentId').optional().isInt({ min: 1 }),
    ],
    validate,
    assignmentController.getAnalytics
);

export default router;
