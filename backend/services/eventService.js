import { randomUUID } from 'crypto';
import { pool, query, queryOne } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

function eventVisibilitySql(role) {
  if (role === 'student') return `e.target_role IN ('all', 'student')`;
  if (role === 'faculty') return `e.target_role IN ('all', 'faculty')`;
  return '1=1';
}

export function assertEventReadable(event, role) {
  if (!event) throw new AppError('Event not found', 404);
  const tr = event.target_role;
  if (role === 'student' && !['all', 'student'].includes(tr)) {
    throw new AppError('Forbidden', 403);
  }
  if (role === 'faculty' && !['all', 'faculty'].includes(tr)) {
    throw new AppError('Forbidden', 403);
  }
}

function toMysqlDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) throw new AppError('Invalid date', 400);
  return d.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
}

export async function listEvents({ role, upcoming, category, search, status, limit = 50 }) {
  const vis = eventVisibilitySql(role);
  let lim = Math.min(100, Math.max(1, Number(limit) || 50));
  lim = Math.trunc(lim);
  let sql = `
    SELECT e.*,
           (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) AS registration_count
    FROM campus_events e
    WHERE ${vis}`;
  const params = [];

  if (category) {
    sql += ` AND e.category = ?`;
    params.push(category);
  }
  if (search) {
    sql += ` AND (e.title LIKE ? OR e.description LIKE ?)`;
    const q = `%${search}%`;
    params.push(q, q);
  }
  if (status === 'upcoming') {
    sql += ` AND e.starts_at > NOW()`;
  } else if (status === 'live') {
    sql += ` AND e.starts_at <= NOW() AND e.ends_at >= NOW()`;
  } else if (status === 'past') {
    sql += ` AND e.ends_at < NOW()`;
  } else if (upcoming === '1' || upcoming === 'true') {
    sql += ` AND e.ends_at >= NOW()`;
  }

  sql += ` ORDER BY e.starts_at ASC LIMIT ${lim}`;
  return query(sql, params);
}

export async function featuredUpcoming(role, limit = 5) {
  const vis = eventVisibilitySql(role);
  let lim = Math.min(20, Math.max(1, Number(limit) || 5));
  lim = Math.trunc(lim);
  return query(
    `SELECT e.*,
            (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) AS registration_count
     FROM campus_events e
     WHERE e.ends_at >= NOW() AND e.is_featured = 1 AND ${vis}
     ORDER BY e.starts_at ASC
     LIMIT ${lim}`
  );
}

export async function getEvent(id) {
  return queryOne(
    `SELECT e.*, u.first_name AS creator_first_name, u.last_name AS creator_last_name
     FROM campus_events e
     JOIN users u ON u.id = e.created_by
     WHERE e.id = ?`,
    [id]
  );
}

export async function createEvent(body, creatorUserId) {
  const {
    title,
    description,
    category = 'general',
    location,
    startsAt,
    endsAt,
    targetRole = 'all',
    departmentId,
    maxAttendees,
    isFeatured,
    bannerUrl,
  } = body;

  const [result] = await pool.execute(
    `INSERT INTO campus_events
      (title, description, category, location, starts_at, ends_at, created_by, target_role,
       department_id, max_attendees, is_featured, banner_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      description,
      category,
      location,
      toMysqlDateTime(startsAt),
      toMysqlDateTime(endsAt),
      creatorUserId,
      targetRole,
      departmentId || null,
      maxAttendees != null && maxAttendees !== '' ? Number(maxAttendees) : null,
      isFeatured ? 1 : 0,
      bannerUrl || null,
    ]
  );
  return result.insertId;
}

export async function updateEvent(id, body, userId, isAdmin) {
  const existing = await queryOne(`SELECT * FROM campus_events WHERE id = ?`, [id]);
  if (!existing) throw new AppError('Event not found', 404);
  if (!isAdmin && existing.created_by !== userId) {
    throw new AppError('Forbidden', 403);
  }

  const {
    title,
    description,
    category,
    location,
    startsAt,
    endsAt,
    targetRole,
    departmentId,
    maxAttendees,
    isFeatured,
    bannerUrl,
  } = body;

  await pool.execute(
    `UPDATE campus_events SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      category = COALESCE(?, category),
      location = COALESCE(?, location),
      starts_at = COALESCE(?, starts_at),
      ends_at = COALESCE(?, ends_at),
      target_role = COALESCE(?, target_role),
      department_id = ?,
      max_attendees = ?,
      is_featured = COALESCE(?, is_featured),
      banner_url = COALESCE(?, banner_url)
     WHERE id = ?`,
    [
      title ?? null,
      description ?? null,
      category ?? null,
      location ?? null,
      startsAt != null ? toMysqlDateTime(startsAt) : null,
      endsAt != null ? toMysqlDateTime(endsAt) : null,
      targetRole ?? null,
      departmentId === undefined ? existing.department_id : departmentId || null,
      maxAttendees === undefined
        ? existing.max_attendees
        : maxAttendees === null || maxAttendees === ''
          ? null
          : Number(maxAttendees),
      isFeatured === undefined ? existing.is_featured : isFeatured ? 1 : 0,
      bannerUrl ?? null,
      id,
    ]
  );
}

export async function deleteEvent(id, userId, isAdmin) {
  const existing = await queryOne(`SELECT created_by FROM campus_events WHERE id = ?`, [id]);
  if (!existing) throw new AppError('Event not found', 404);
  if (!isAdmin && existing.created_by !== userId) {
    throw new AppError('Forbidden', 403);
  }
  await pool.execute(`DELETE FROM campus_events WHERE id = ?`, [id]);
}

export async function userRegistered(eventId, userId) {
  const r = await queryOne(
    `SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ?`,
    [eventId, userId]
  );
  return Boolean(r);
}

export async function registerForEvent(eventId, userId, userRole) {
  const event = await queryOne(`SELECT * FROM campus_events WHERE id = ?`, [eventId]);
  if (!event) throw new AppError('Event not found', 404);
  assertEventReadable(event, userRole);

  const dup = await queryOne(
    `SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ?`,
    [eventId, userId]
  );
  if (dup) throw new AppError('Already registered', 400);

  if (event.max_attendees) {
    const c = await queryOne(
      `SELECT COUNT(*) AS n FROM event_registrations WHERE event_id = ?`,
      [eventId]
    );
    if (Number(c?.n || 0) >= Number(event.max_attendees)) {
      throw new AppError('Event is at full capacity', 400);
    }
  }

  const code = randomUUID();
  await pool.execute(
    `INSERT INTO event_registrations (event_id, user_id, role_at_register, registration_code)
     VALUES (?, ?, ?, ?)`,
    [eventId, userId, userRole, code]
  );
}

export async function unregisterEvent(eventId, userId) {
  await pool.execute(
    `DELETE FROM event_registrations WHERE event_id = ? AND user_id = ?`,
    [eventId, userId]
  );
}

export async function getRegistrationTicket(eventId, userId) {
  return queryOne(
    `SELECT registration_code, registered_at, event_id, user_id
     FROM event_registrations WHERE event_id = ? AND user_id = ?`,
    [eventId, userId]
  );
}

export async function listRegistrations(eventId) {
  return query(
    `SELECT er.registered_at, er.registration_code,
            u.email, u.first_name, u.last_name, u.role
     FROM event_registrations er
     JOIN users u ON u.id = er.user_id
     WHERE er.event_id = ?
     ORDER BY er.registered_at ASC`,
    [eventId]
  );
}

export async function listMyEventRegistrations(userId) {
  return query(
    `SELECT e.*, er.registered_at, er.registration_code
     FROM event_registrations er
     JOIN campus_events e ON e.id = er.event_id
     WHERE er.user_id = ?
     ORDER BY e.starts_at DESC`,
    [userId]
  );
}
