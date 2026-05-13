import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pool } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import * as uploadRegistryService from '../services/uploadRegistryService.js';
import { parseLimitOffset } from '../utils/pagination.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, '..', 'uploads');

function physicalPath(row) {
  if (row.scope === 'notice_attachment') return path.join(uploadsRoot, 'notices', row.stored_name);
  if (row.scope === 'event_banner') return path.join(uploadsRoot, 'events', row.stored_name);
  if (row.scope === 'avatar') return path.join(uploadsRoot, 'avatars', row.stored_name);
  return null;
}

export const myFiles = asyncHandler(async (req, res) => {
  const { limit } = parseLimitOffset(
    { limit: req.query.limit, offset: 0 },
    { defaultLimit: 50, maxLimit: 100 }
  );
  const rows = await uploadRegistryService.listForUser(req.user.id, {
    limit,
    offset: 0,
  });
  res.json({ success: true, files: rows });
});

export const myStats = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT scope, COUNT(*) AS cnt, COALESCE(SUM(size_bytes),0) AS bytes
     FROM uploaded_files WHERE user_id = ? GROUP BY scope`,
    [req.user.id]
  );
  res.json({ success: true, stats: rows });
});

export const adminAll = asyncHandler(async (req, res) => {
  const { limit, offset } = parseLimitOffset(req.query, {
    defaultLimit: 50,
    maxLimit: 200,
  });
  const rows = await uploadRegistryService.listAllAdmin({
    limit,
    offset,
    scope: req.query.scope,
  });
  res.json({ success: true, files: rows });
});

export const adminStats = asyncHandler(async (req, res) => {
  const s = await uploadRegistryService.statsGlobal();
  res.json({ success: true, ...s });
});

export const removeMine = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const [rows] = await pool.execute(
    `SELECT * FROM uploaded_files WHERE id = ? AND user_id = ?`,
    [id, req.user.id]
  );
  const row = rows[0];
  if (!row) throw new AppError('Not found', 404);
  if (row.scope === 'avatar') throw new AppError('Use profile to change avatar', 400);
  const p = physicalPath(row);
  if (p) {
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch {
      /* */
    }
  }
  await uploadRegistryService.deleteByIdForUser(id, req.user.id);
  res.json({ success: true });
});
