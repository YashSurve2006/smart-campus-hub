import { pool, query, queryOne } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export async function studentAttendanceSummary(studentDbId) {
  const rows = await query(
    `SELECT status, COUNT(*) AS cnt
     FROM attendance_records
     WHERE student_id = ?
     GROUP BY status`,
    [studentDbId]
  );
  const map = Object.fromEntries(rows.map((r) => [r.status, Number(r.cnt)]));
  const present = map.present || 0;
  const absent = map.absent || 0;
  const late = map.late || 0;
  const total = present + absent + late;
  const percentage = total === 0 ? 0 : Math.round(((present + late * 0.5) / total) * 1000) / 10;
  return { present, absent, late, total, percentage };
}

export async function listStudentAttendance(studentDbId, { from, to, limit = 100 }) {
  let sql = `
    SELECT ar.id, ar.attendance_date, ar.status, te.subject_name, te.start_time, te.end_time,
           c.name AS classroom_name, c.building
    FROM attendance_records ar
    JOIN timetable_entries te ON te.id = ar.timetable_entry_id
    JOIN classrooms c ON c.id = te.classroom_id
    WHERE ar.student_id = ?
  `;
  const params = [studentDbId];
  if (from) {
    sql += ` AND ar.attendance_date >= ?`;
    params.push(from);
  }
  if (to) {
    sql += ` AND ar.attendance_date <= ?`;
    params.push(to);
  }
  const rawLimit = Number.parseInt(limit, 10);
  let safeLimit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 100;
  if (!Number.isFinite(safeLimit) || safeLimit <= 0) safeLimit = 100;
  safeLimit = Math.min(500, Math.max(1, safeLimit));

  // NOTE: MySQL doesn't accept bound placeholders for LIMIT/OFFSET in this project setup.
  // We interpolate only validated integers to avoid ER_WRONG_ARGUMENTS.
  sql += ` ORDER BY ar.attendance_date DESC, te.start_time DESC LIMIT ${Math.trunc(safeLimit)}`;
  return query(sql, params);
}

export async function markAttendance({
  timetableEntryId,
  attendanceDate,
  records,
  markedByUserId,
  facultyUserId,
}) {
  const faculty = await queryOne(
    `SELECT f.id FROM faculty f WHERE f.user_id = ?`,
    [facultyUserId]
  );
  if (!faculty) throw new AppError('Faculty profile not found', 403);

  const entry = await queryOne(
    `SELECT id, faculty_id FROM timetable_entries WHERE id = ?`,
    [timetableEntryId]
  );
  if (!entry) throw new AppError('Timetable entry not found', 404);
  if (entry.faculty_id !== faculty.id) {
    throw new AppError('This class is not assigned to you', 403);
  }

  if (!Array.isArray(records) || records.length === 0) {
    throw new AppError('Attendance records required');
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const r of records) {
      const { studentId, status = 'present' } = r;
      if (!studentId) continue;
      await conn.execute(
        `INSERT INTO attendance_records
         (timetable_entry_id, student_id, attendance_date, status, marked_by)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by)`,
        [timetableEntryId, studentId, attendanceDate, status, markedByUserId]
      );
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  return { success: true };
}

export async function studentsForTimetableEntry(timetableEntryId, departmentId) {
  const entry = await queryOne(
    `SELECT department_id, semester FROM timetable_entries WHERE id = ?`,
    [timetableEntryId]
  );
  if (!entry) throw new AppError('Timetable entry not found', 404);
  return query(
    `SELECT s.id, s.student_code, u.first_name, u.last_name
     FROM students s
     JOIN users u ON u.id = s.user_id
     WHERE s.department_id = ? AND s.semester = ?`,
    [entry.department_id, entry.semester]
  );
}
