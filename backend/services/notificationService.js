import { pool, query, queryOne } from '../config/db.js';

export async function sendNotification({ userId, title, message, type, targetRole }) {
  if (userId) {
    await createUserNotification(userId, { title, message, type });
  } else {
    await createNotificationsForRole({ title, message, type, targetRole: targetRole || 'student' });
  }
}

export async function createNotificationsForRole({ title, message, type, targetRole }) {
  let roleFilter = '';
  if (targetRole === 'student') roleFilter = `role = 'student'`;
  else if (targetRole === 'faculty') roleFilter = `role = 'faculty'`;
  else roleFilter = `role IN ('student','faculty')`;

  const users = await query(`SELECT id FROM users WHERE ${roleFilter}`);
  if (!users.length) return;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const u of users) {
      await conn.execute(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
        [u.id, title, message, type || 'notice']
      );
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function createUserNotification(userId, { title, message, type } = {}) {
  if (!userId) return;
  await query(
    `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
    [userId, title || 'Notification', message || '', type || 'notice']
  );
}

export async function listNotifications(userId, { unreadOnly } = {}) {
  let sql = `
    SELECT id, title, message, type, read_at, created_at
    FROM notifications
    WHERE user_id = ?
  `;
  const params = [userId];
  if (unreadOnly) sql += ` AND read_at IS NULL`;
  sql += ` ORDER BY created_at DESC LIMIT 100`;
  return query(sql, params);
}

export async function markNotificationRead(userId, id) {
  await query(
    `UPDATE notifications SET read_at = NOW() WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
}

export async function markAllRead(userId) {
  await query(`UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL`, [
    userId,
  ]);
}
