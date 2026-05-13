import { query } from '../config/db.js';

export async function attendanceByDepartment() {
  return query(`
    SELECT d.name AS department,
           SUM(CASE WHEN ar.status IN ('present','late') THEN 1 ELSE 0 END) AS attended,
           SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END) AS absent,
           COUNT(ar.id) AS total
    FROM attendance_records ar
    JOIN students s ON s.id = ar.student_id
    JOIN departments d ON d.id = s.department_id
    GROUP BY d.id, d.name
    ORDER BY d.name
  `);
}

export async function enrollmentTrend() {
  return query(`
    SELECT YEAR(u.created_at) AS year, MONTH(u.created_at) AS month, COUNT(*) AS new_users
    FROM users u
    WHERE u.role = 'student' AND u.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
    GROUP BY YEAR(u.created_at), MONTH(u.created_at)
    ORDER BY year, month
  `);
}

export async function noticesOverTime() {
  return query(`
    SELECT DATE(created_at) AS day, COUNT(*) AS cnt
    FROM notices
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE(created_at)
    ORDER BY day
  `);
}

export async function attendanceDailyTrend(days = 30) {
  return query(
    `
    SELECT DATE(ar.attendance_date) AS day,
           SUM(CASE WHEN ar.status IN ('present','late') THEN 1 ELSE 0 END) AS attended,
           SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END) AS absent
    FROM attendance_records ar
    WHERE ar.attendance_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    GROUP BY DATE(ar.attendance_date)
    ORDER BY day
  `,
    [days]
  );
}

export async function facultyActivityStats() {
  return query(`
    SELECT u.id, u.first_name, u.last_name,
           (SELECT COUNT(*) FROM notices n WHERE n.author_id = u.id AND n.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)) AS notices_90d,
           (SELECT COUNT(*) FROM timetable_entries te JOIN faculty f ON f.id = te.faculty_id WHERE f.user_id = u.id) AS timetable_slots
    FROM users u
    WHERE u.role = 'faculty'
    ORDER BY notices_90d DESC
    LIMIT 24
  `);
}

export async function timetableLoadByDepartment() {
  return query(`
    SELECT d.name AS department, COUNT(te.id) AS slot_count
    FROM departments d
    LEFT JOIN timetable_entries te ON te.department_id = d.id
    GROUP BY d.id, d.name
    ORDER BY slot_count DESC
  `);
}

export async function eventsOverTime() {
  return query(`
    SELECT DATE(created_at) AS day, COUNT(*) AS cnt
    FROM campus_events
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)
    GROUP BY DATE(created_at)
    ORDER BY day
  `);
}

export async function registrationTrend() {
  return query(`
    SELECT DATE(registered_at) AS day, COUNT(*) AS cnt
    FROM event_registrations
    WHERE registered_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)
    GROUP BY DATE(registered_at)
    ORDER BY day
  `);
}

export async function topEventsByRegistrations(limit = 10) {
  const rawLimit = Number.parseInt(limit, 10);
  let safeLimit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 10;
  if (!Number.isFinite(safeLimit) || safeLimit <= 0) safeLimit = 10;
  safeLimit = Math.min(50, Math.max(1, safeLimit));
  safeLimit = Math.trunc(safeLimit);

  return query(
    `
    SELECT e.id, e.title, e.starts_at, COUNT(er.id) AS registrations
    FROM campus_events e
    LEFT JOIN event_registrations er ON er.event_id = e.id
    GROUP BY e.id, e.title, e.starts_at
    ORDER BY registrations DESC
    LIMIT ${safeLimit}
  `,
    []
  );
}
