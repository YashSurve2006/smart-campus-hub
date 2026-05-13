import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/audit-logs', adminController.listAuditLogs);
router.get('/students', adminController.listStudents);
router.get('/faculty', adminController.listFaculty);
router.patch(
  '/students/:userId',
  [param('userId').isInt({ min: 1 })],
  validate,
  adminController.patchStudent
);
router.patch(
  '/faculty/:userId',
  [param('userId').isInt({ min: 1 })],
  validate,
  adminController.patchFaculty
);
router.post(
  '/users',
  [
    body('email').isEmail(),
    body('password').isString().isLength({ min: 8 }),
    body('role').isIn(['student', 'faculty', 'admin']),
    body('firstName').trim().notEmpty().isLength({ max: 80 }),
    body('lastName').trim().notEmpty().isLength({ max: 80 }),
  ],
  validate,
  adminController.createUser
);
router.delete('/users/:userId', [param('userId').isInt({ min: 1 })], validate, adminController.deleteUser);

export default router;
