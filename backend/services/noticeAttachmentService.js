import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import * as uploadRegistryService from './uploadRegistryService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'uploads', 'notices');

export async function listByNoticeId(noticeId) {
  return query(
    `SELECT id, notice_id, stored_name, original_name, mime_type, size_bytes, created_at
     FROM notice_attachments WHERE notice_id = ? ORDER BY id`,
    [noticeId]
  );
}

export async function addAttachment(noticeId, file, uploadedByUserId) {
  if (!file) throw new AppError('File required');
  const [result] = await pool.execute(
    `INSERT INTO notice_attachments (notice_id, stored_name, original_name, mime_type, size_bytes)
     VALUES (?, ?, ?, ?, ?)`,
    [
      noticeId,
      file.filename,
      file.originalname?.slice(0, 250) || 'file',
      file.mimetype,
      file.size,
    ]
  );
  const id = result.insertId;
  if (uploadedByUserId) {
    try {
      await uploadRegistryService.recordFile({
        userId: uploadedByUserId,
        scope: 'notice_attachment',
        entityType: 'notice',
        entityId: String(noticeId),
        publicPath: `/api/notices/${noticeId}/attachments/${id}/file`,
        storedName: file.filename,
        originalName: file.originalname?.slice(0, 250) || 'file',
        mimeType: file.mimetype,
        sizeBytes: file.size,
      });
    } catch {
      /* uploaded_files table may be absent on unmigrated DB */
    }
  }
  return id;
}

export async function assertNoticeAccess(noticeId, userId, isAdmin) {
  const [rows] = await pool.execute(`SELECT author_id FROM notices WHERE id = ?`, [noticeId]);
  const n = rows[0];
  if (!n) throw new AppError('Notice not found', 404);
  if (!isAdmin && n.author_id !== userId) throw new AppError('Forbidden', 403);
}

export async function deleteFilesForNotice(noticeId) {
  const files = await listByNoticeId(noticeId);
  for (const f of files) {
    const p = path.join(uploadDir, f.stored_name);
    try {
      await fs.unlink(p);
    } catch {
      /* ignore missing */
    }
  }
}
