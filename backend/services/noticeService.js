import { pool, query, queryOne } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import * as noticeAttachmentService from './noticeAttachmentService.js';

function visibilityWhere(role) {
  if (role === 'student') return `n.target_role IN ('all', 'student')`;
  if (role === 'faculty') return `n.target_role IN ('all', 'faculty')`;
  return '1=1';
}

export function assertNoticeReadable(row, role) {
  if (!row) throw new AppError('Notice not found', 404);
  const tr = row.target_role;
  if (role === 'student' && !['all', 'student'].includes(tr)) {
    throw new AppError('Forbidden', 403);
  }
  if (role === 'faculty' && !['all', 'faculty'].includes(tr)) {
    throw new AppError('Forbidden', 403);
  }
}

export async function listNotices({
  role,
  userId,
  search,
  departmentId,
  limit = 50,
  noticeCategory,
  priority,
  favoritesOnly,
  unreadOnly,
}) {
  const vis = visibilityWhere(role);
  let lim = Number.parseInt(limit, 10);
  if (!Number.isFinite(lim) || lim <= 0) lim = 50;
  lim = Math.min(100, Math.max(1, lim));
  lim = Math.trunc(lim);
  const needsEngagement = (role === 'student' || role === 'faculty') && userId;

  let sql = `
    SELECT n.id, n.title, n.body, n.target_role, n.attachment_url, n.created_at,
           n.notice_category, n.priority,
           u.first_name AS author_first_name, u.last_name AS author_last_name,
           d.name AS department_name,
           (SELECT COUNT(*) FROM notice_attachments na WHERE na.notice_id = n.id) AS attachment_count`;

  if (needsEngagement) {
    sql += `,
           (nr.notice_id IS NOT NULL) AS is_read,
           (nf.notice_id IS NOT NULL) AS is_favorite`;
  } else {
    sql += `, 1 AS is_read, 0 AS is_favorite`;
  }

  sql += `
    FROM notices n
    JOIN users u ON u.id = n.author_id
    LEFT JOIN departments d ON d.id = n.department_id`;

  const params = [];
  if (needsEngagement) {
    sql += `
    LEFT JOIN notice_reads nr ON nr.notice_id = n.id AND nr.user_id = ?
    LEFT JOIN notice_favorites nf ON nf.notice_id = n.id AND nf.user_id = ?`;
    params.push(userId, userId);
  }

  sql += ` WHERE ${vis}`;

  if (search) {
    sql += ` AND (n.title LIKE ? OR n.body LIKE ?)`;
    const q = `%${search}%`;
    params.push(q, q);
  }
  if (departmentId) {
    sql += ` AND (n.department_id IS NULL OR n.department_id = ?)`;
    params.push(departmentId);
  }
  if (noticeCategory) {
    sql += ` AND n.notice_category = ?`;
    params.push(noticeCategory);
  }
  if (priority) {
    sql += ` AND n.priority = ?`;
    params.push(priority);
  }
  if (favoritesOnly && needsEngagement) {
    sql += ` AND nf.notice_id IS NOT NULL`;
  }
  if (unreadOnly && needsEngagement) {
    sql += ` AND nr.notice_id IS NULL`;
  }

  sql += ` ORDER BY n.created_at DESC LIMIT ${lim}`;
  return query(sql, params);
}

export async function countUnreadNotices(userId, role) {
  if (role !== 'student' && role !== 'faculty') return 0;
  const vis = visibilityWhere(role);
  const row = await queryOne(
    `SELECT COUNT(*) AS c FROM notices n
     LEFT JOIN notice_reads nr ON nr.notice_id = n.id AND nr.user_id = ?
     WHERE ${vis} AND nr.notice_id IS NULL`,
    [userId]
  );
  return Number(row?.c || 0);
}

export async function markNoticeRead(userId, noticeId, role) {
  const row = await getNoticeById(noticeId);
  assertNoticeReadable(row, role);
  await pool.execute(
    `INSERT IGNORE INTO notice_reads (user_id, notice_id) VALUES (?, ?)`,
    [userId, noticeId]
  );
}

export async function addFavorite(userId, noticeId, role) {
  const row = await getNoticeById(noticeId);
  assertNoticeReadable(row, role);
  await pool.execute(
    `INSERT IGNORE INTO notice_favorites (user_id, notice_id) VALUES (?, ?)`,
    [userId, noticeId]
  );
}

export async function removeFavorite(userId, noticeId) {
  await pool.execute(
    `DELETE FROM notice_favorites WHERE user_id = ? AND notice_id = ?`,
    [userId, noticeId]
  );
}

export async function getNoticeById(id) {
  return queryOne(
    `SELECT n.*, u.first_name AS author_first_name, u.last_name AS author_last_name
     FROM notices n
     JOIN users u ON u.id = n.author_id
     WHERE n.id = ?`,
    [id]
  );
}

export async function createNotice(data, authorId) {
  const {
    title,
    body,
    targetRole = 'all',
    departmentId,
    attachmentUrl,
    noticeCategory,
    notice_category,
    priority,
  } = data;
  if (!title || !body) throw new AppError('Title and body are required');
  const cat = noticeCategory || notice_category || 'general';
  const pri = priority || 'normal';

  const [result] = await pool.execute(
    `INSERT INTO notices
      (title, body, author_id, target_role, department_id, attachment_url, notice_category, priority)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, body, authorId, targetRole, departmentId || null, attachmentUrl || null, cat, pri]
  );
  return result.insertId;
}

export async function updateNotice(id, data, userId, isAdmin) {
  const notice = await queryOne('SELECT * FROM notices WHERE id = ?', [id]);
  if (!notice) throw new AppError('Notice not found', 404);
  if (!isAdmin && notice.author_id !== userId) {
    throw new AppError('Not allowed to edit this notice', 403);
  }
  const {
    title,
    body,
    targetRole,
    departmentId,
    attachmentUrl,
    noticeCategory,
    notice_category,
    priority,
  } = data;

  const cat = noticeCategory ?? notice_category;
  const pri = priority;

  await query(
    `UPDATE notices SET
      title = COALESCE(?, title),
      body = COALESCE(?, body),
      target_role = COALESCE(?, target_role),
      department_id = ?,
      attachment_url = COALESCE(?, attachment_url),
      notice_category = COALESCE(?, notice_category),
      priority = COALESCE(?, priority)
     WHERE id = ?`,
    [
      title ?? notice.title,
      body ?? notice.body,
      targetRole ?? notice.target_role,
      departmentId === undefined ? notice.department_id : departmentId,
      attachmentUrl ?? notice.attachment_url,
      cat ?? notice.notice_category,
      pri ?? notice.priority,
      id,
    ]
  );
  return getNoticeById(id);
}

export async function deleteNotice(id, userId, isAdmin) {
  const notice = await queryOne('SELECT author_id FROM notices WHERE id = ?', [id]);
  if (!notice) throw new AppError('Notice not found', 404);
  if (!isAdmin && notice.author_id !== userId) {
    throw new AppError('Not allowed to delete this notice', 403);
  }
  await noticeAttachmentService.deleteFilesForNotice(id);
  await query('DELETE FROM notices WHERE id = ?', [id]);
}
