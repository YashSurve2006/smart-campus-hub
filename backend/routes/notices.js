import { Router } from 'express';
import { param } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { uploadNoticeFiles } from '../utils/multerNotice.js';
import * as noticeController from '../controllers/noticeController.js';

const router = Router();

router.get('/meta/unread-count', authenticate, noticeController.unreadCount);

router.get('/', authenticate, noticeController.listNotices);

router.post(
  '/',
  authenticate,
  requireRole('faculty', 'admin'),
  noticeController.createNotice
);

router.post(
  '/:id/read',
  authenticate,
  [param('id').isInt({ min: 1 })],
  validate,
  noticeController.markRead
);

router.post(
  '/:id/favorite',
  authenticate,
  [param('id').isInt({ min: 1 })],
  validate,
  noticeController.favoriteAdd
);

router.delete(
  '/:id/favorite',
  authenticate,
  [param('id').isInt({ min: 1 })],
  validate,
  noticeController.favoriteRemove
);

router.post(
  '/:id/attachments',
  authenticate,
  requireRole('faculty', 'admin'),
  uploadLimiter,
  uploadNoticeFiles.array('files', 6),
  [param('id').isInt({ min: 1 })],
  validate,
  noticeController.addAttachments
);

router.get(
  '/:id/attachments/:attachmentId/file',
  authenticate,
  [
    param('id').isInt({ min: 1 }),
    param('attachmentId').isInt({ min: 1 }),
  ],
  validate,
  noticeController.downloadAttachment
);

router.get('/:id', authenticate, noticeController.getNotice);

router.patch(
  '/:id',
  authenticate,
  requireRole('faculty', 'admin'),
  noticeController.updateNotice
);

router.delete(
  '/:id',
  authenticate,
  requireRole('faculty', 'admin'),
  noticeController.deleteNotice
);

export default router;
