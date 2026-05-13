import { asyncHandler } from '../utils/asyncHandler.js';
import { pool, query, queryOne } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import * as adminService from '../services/adminService.js';
import * as auditService from '../services/auditService.js';
import { broadcastUserDirectoryChanged } from '../realtime/socketHub.js';
import { parsePageLimit } from '../utils/pagination.js';

export const listStudents = asyncHandler(async (req, res) => {
  const data = await adminService.listStudents(req.query);
  res.json({
    success: true,
    students: data.rows,
    pagination: {
      total: data.total,
      page: data.page,
      limit: data.limit,
      pages: Math.max(1, Math.ceil(data.total / data.limit)),
    },
  });
});

export const listFaculty = asyncHandler(async (req, res) => {
  const data = await adminService.listFacultyMembers(req.query);
  res.json({
    success: true,
    faculty: data.rows,
    pagination: {
      total: data.total,
      page: data.page,
      limit: data.limit,
      pages: Math.max(1, Math.ceil(data.total / data.limit)),
    },
  });
});

export const patchStudent = asyncHandler(async (req, res) => {
  await adminService.updateStudentUser(req.params.userId, req.body);
  res.json({ success: true });
});

export const patchFaculty = asyncHandler(async (req, res) => {
  await adminService.updateFacultyUser(req.params.userId, req.body);
  res.json({ success: true });
});

export const createUser = asyncHandler(async (req, res) => {
  const result = await adminService.adminCreateUser(req.body);
  broadcastUserDirectoryChanged(req.app.get('io'), { action: 'user_created' });
  res.status(201).json({ success: true, ...result });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const [users] = await pool.execute(`SELECT id, role FROM users WHERE id = ?`, [userId]);
  const u = users[0];
  if (!u) throw new AppError('User not found', 404);
  if (u.role === 'admin') throw new AppError('Cannot delete admin this way', 403);
  await auditService.logAudit({
    userId: req.user.id,
    action: 'user_delete',
    entityType: 'user',
    entityId: userId,
    metadata: { deletedRole: u.role },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });
  await pool.execute(`DELETE FROM users WHERE id = ?`, [userId]);
  broadcastUserDirectoryChanged(req.app.get('io'), { action: 'user_deleted' });
  res.json({ success: true });
});

export const listAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePageLimit(req.query, {
    defaultLimit: 30,
    maxLimit: 100,
  });
  const rows = await query(
    `SELECT a.*, u.email AS actor_email
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.user_id
     ORDER BY a.created_at DESC
     LIMIT ${Math.trunc(limit)} OFFSET ${Math.trunc(offset)}`
  );
  const totalRow = await queryOne(`SELECT COUNT(*) AS c FROM audit_logs`);
  const total = Number(totalRow?.c || 0);
  res.json({
    success: true,
    logs: rows,
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  });
});
