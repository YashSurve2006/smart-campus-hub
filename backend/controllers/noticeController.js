import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as noticeService from '../services/noticeService.js';
import * as notificationService from '../services/notificationService.js';
import * as noticeAttachmentService from '../services/noticeAttachmentService.js';
import { broadcastNoticeCreated } from '../realtime/socketHub.js';
import { AppError } from '../utils/AppError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const noticeUploadDir = path.join(__dirname, '..', 'uploads', 'notices');

export const unreadCount = asyncHandler(async (req, res) => {
  const count = await noticeService.countUnreadNotices(req.user.id, req.user.role);
  res.json({ success: true, unreadCount: count });
});

export const listNotices = asyncHandler(async (req, res) => {
  const {
    search,
    departmentId,
    limit,
    noticeCategory,
    priority,
    favoritesOnly,
    unreadOnly,
  } = req.query;
  const rows = await noticeService.listNotices({
    role: req.user.role,
    userId: req.user.id,
    search,
    departmentId: departmentId ? Number(departmentId) : undefined,
    noticeCategory: noticeCategory || undefined,
    priority: priority || undefined,
    favoritesOnly: favoritesOnly === '1' || favoritesOnly === 'true',
    unreadOnly: unreadOnly === '1' || unreadOnly === 'true',
    limit,
  });
  res.json({ success: true, notices: rows });
});

export const markRead = asyncHandler(async (req, res) => {
  await noticeService.markNoticeRead(req.user.id, req.params.id, req.user.role);
  res.json({ success: true });
});

export const favoriteAdd = asyncHandler(async (req, res) => {
  await noticeService.addFavorite(req.user.id, req.params.id, req.user.role);
  res.json({ success: true });
});

export const favoriteRemove = asyncHandler(async (req, res) => {
  await noticeService.removeFavorite(req.user.id, req.params.id);
  res.json({ success: true });
});

export const getNotice = asyncHandler(async (req, res) => {
  const row = await noticeService.getNoticeById(req.params.id);
  noticeService.assertNoticeReadable(row, req.user.role);
  const attachments = await noticeAttachmentService.listByNoticeId(req.params.id);
  res.json({ success: true, notice: row, attachments });
});

export const createNotice = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const id = await noticeService.createNotice(req.body, req.user.id);
  const notice = await noticeService.getNoticeById(id);

  const title = 'New notice';
  const message = notice.title;
  await notificationService.createNotificationsForRole({
    title,
    message,
    type: 'notice',
    targetRole: notice.target_role === 'all' ? 'all' : notice.target_role,
  });

  broadcastNoticeCreated(io, notice);

  res.status(201).json({ success: true, notice });
});

export const addAttachments = asyncHandler(async (req, res) => {
  const noticeId = Number(req.params.id);
  const isAdmin = req.user.role === 'admin';
  await noticeAttachmentService.assertNoticeAccess(noticeId, req.user.id, isAdmin);
  const files = req.files || [];
  if (!files.length) throw new AppError('No files uploaded', 400);
  const created = [];
  for (const file of files) {
    const aid = await noticeAttachmentService.addAttachment(noticeId, file, req.user.id);
    created.push(aid);
  }
  const attachments = await noticeAttachmentService.listByNoticeId(noticeId);
  res.status(201).json({ success: true, attachmentIds: created, attachments });
});

export const downloadAttachment = asyncHandler(async (req, res) => {
  const attachmentId = req.params.attachmentId;
  const noticeId = Number(req.params.id);
  const row = await noticeService.getNoticeById(noticeId);
  noticeService.assertNoticeReadable(row, req.user.role);

  const { queryOne } = await import('../config/db.js');
  const att = await queryOne(
    `SELECT * FROM notice_attachments WHERE id = ? AND notice_id = ?`,
    [attachmentId, noticeId]
  );
  if (!att) throw new AppError('Attachment not found', 404);

  const filePath = path.join(noticeUploadDir, att.stored_name);
  if (!fs.existsSync(filePath)) throw new AppError('File missing', 404);

  res.setHeader('Content-Type', att.mime_type);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(att.original_name)}"`);
  fs.createReadStream(filePath).pipe(res);
});

export const updateNotice = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const notice = await noticeService.updateNotice(req.params.id, req.body, req.user.id, isAdmin);
  res.json({ success: true, notice });
});

export const deleteNotice = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  await noticeService.deleteNotice(req.params.id, req.user.id, isAdmin);
  res.json({ success: true });
});
