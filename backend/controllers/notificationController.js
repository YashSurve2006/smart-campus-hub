import { asyncHandler } from '../utils/asyncHandler.js';
import * as notificationService from '../services/notificationService.js';

export const listMine = asyncHandler(async (req, res) => {
  const unreadOnly = req.query.unread === '1';
  const rows = await notificationService.listNotifications(req.user.id, { unreadOnly });
  res.json({ success: true, notifications: rows });
});

export const readOne = asyncHandler(async (req, res) => {
  await notificationService.markNotificationRead(req.user.id, req.params.id);
  res.json({ success: true });
});

export const readAll = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user.id);
  res.json({ success: true });
});
