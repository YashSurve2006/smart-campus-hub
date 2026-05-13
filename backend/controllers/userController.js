import { asyncHandler } from '../utils/asyncHandler.js';
import { pool, query, queryOne } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import * as authService from '../services/authService.js';
import * as uploadRegistryService from '../services/uploadRegistryService.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, avatarUrl, specialization } = req.body;
  await pool.execute(
    `UPDATE users SET
      first_name = COALESCE(?, first_name),
      last_name = COALESCE(?, last_name),
      phone = COALESCE(?, phone),
      avatar_url = COALESCE(?, avatar_url)
     WHERE id = ?`,
    [firstName ?? null, lastName ?? null, phone ?? null, avatarUrl ?? null, req.user.id]
  );

  if (req.user.role === 'faculty' && specialization !== undefined) {
    try {
      await pool.execute(`UPDATE faculty SET specialization = ? WHERE user_id = ?`, [
        specialization || null,
        req.user.id,
      ]);
    } catch {
      /* specialization column */
    }
  }

  const user = await authService.getUserProfile(req.user.id);
  res.json({ success: true, user });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Image required', 400);
  const url = `/api/files/avatars/${req.file.filename}`;
  await pool.execute(`UPDATE users SET avatar_url = ? WHERE id = ?`, [url, req.user.id]);
  try {
    await uploadRegistryService.recordFile({
      userId: req.user.id,
      scope: 'avatar',
      entityType: 'user',
      entityId: String(req.user.id),
      publicPath: url,
      storedName: req.file.filename,
      originalName: req.file.originalname?.slice(0, 250) || 'avatar',
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    });
  } catch {
    /* uploaded_files */
  }
  const user = await authService.getUserProfile(req.user.id);
  res.json({ success: true, url, user });
});

export const listActivity = asyncHandler(async (req, res) => {
  let rows = [];
  try {
    rows = await query(
      `SELECT action, details, created_at FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 40`,
      [req.user.id]
    );
  } catch {
    rows = [];
  }
  res.json({ success: true, activity: rows });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    throw new AppError('Invalid password payload');
  }
  const bcrypt = (await import('bcryptjs')).default;
  const user = await queryOne(`SELECT password_hash FROM users WHERE id = ?`, [req.user.id]);
  const ok = await bcrypt.compare(currentPassword, user.password_hash);
  if (!ok) throw new AppError('Current password incorrect', 400);
  const hash = await bcrypt.hash(newPassword, 12);
  await pool.execute(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, req.user.id]);
  try {
    await pool.execute(`INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)`, [
      req.user.id,
      'password_change',
      'Password updated',
    ]);
  } catch {
    /* */
  }
  res.json({ success: true });
});
