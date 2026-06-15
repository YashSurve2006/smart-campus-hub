import { pool, query } from '../config/db.js';

export async function recordFile({
  userId,
  scope,
  entityType,
  entityId,
  publicPath,
  storedName,
  originalName,
  mimeType,
  sizeBytes,
  cloudUrl,
  cloudPublicId,
  cloudFolder,
}) {
  const [r] = await pool.execute(
    `INSERT INTO uploaded_files
      (user_id, scope, entity_type, entity_id, public_path, stored_name, original_name, mime_type, size_bytes, cloud_url, cloud_public_id, cloud_folder)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      scope,
      entityType ?? null,
      entityId ?? null,
      publicPath ?? '',
      storedName,
      originalName,
      mimeType,
      sizeBytes ?? 0,
      cloudUrl ?? null,
      cloudPublicId ?? null,
      cloudFolder ?? null,
    ]
  );
  return r.insertId;
}

export async function listForUser(userId, { limit = 50, offset = 0 }) {
  const rawLimit = Number.parseInt(limit, 10);
  let lim = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 50;
  if (!Number.isFinite(lim) || lim <= 0) lim = 50;
  lim = Math.max(1, Math.min(100, lim));

  const rawOffset = Number.parseInt(offset, 10);
  const off = Math.max(0, Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0);
  return query(
    `SELECT * FROM uploaded_files
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ${Math.trunc(lim)} OFFSET ${Math.trunc(off)}`,
    [userId]
  );
}

export async function listAllAdmin({ limit = 50, offset = 0, scope }) {
  const rawLimit = Number.parseInt(limit, 10);
  let lim = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 50;
  if (!Number.isFinite(lim) || lim <= 0) lim = 50;
  lim = Math.max(1, Math.min(200, lim));

  const rawOffset = Number.parseInt(offset, 10);
  const off = Math.max(0, Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0);
  let sql = `SELECT uf.*, u.email AS user_email
             FROM uploaded_files uf
             JOIN users u ON u.id = uf.user_id WHERE 1=1`;
  const params = [];
  if (scope) {
    sql += ` AND uf.scope = ?`;
    params.push(scope);
  }
  // NOTE: MySQL doesn't accept bound placeholders for LIMIT/OFFSET in this project setup.
  // We interpolate only validated integers to avoid ER_WRONG_ARGUMENTS.
  sql += ` ORDER BY uf.created_at DESC LIMIT ${Math.trunc(lim)} OFFSET ${Math.trunc(off)}`;
  return query(sql, params);
}

export async function statsGlobal() {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS totalFiles, COALESCE(SUM(size_bytes),0) AS totalBytes FROM uploaded_files`
  );
  return rows[0] || { totalFiles: 0, totalBytes: 0 };
}

export async function deleteByIdForUser(id, userId) {
  await pool.execute(`DELETE FROM uploaded_files WHERE id = ? AND user_id = ?`, [id, userId]);
}
