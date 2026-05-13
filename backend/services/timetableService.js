import { pool, query, queryOne } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export async function listTimetable({ departmentId, semester, dayOfWeek, facultyDbId }) {
  let sql = `
    SELECT te.*, c.name AS classroom_name, c.building,
           u.first_name AS faculty_first_name, u.last_name AS faculty_last_name
    FROM timetable_entries te
    JOIN classrooms c ON c.id = te.classroom_id
    JOIN faculty f ON f.id = te.faculty_id
    JOIN users u ON u.id = f.user_id
    WHERE 1=1
  `;
  const params = [];
  if (departmentId) {
    sql += ` AND te.department_id = ?`;
    params.push(departmentId);
  }
  if (semester) {
    sql += ` AND te.semester = ?`;
    params.push(semester);
  }
  if (dayOfWeek) {
    sql += ` AND te.day_of_week = ?`;
    params.push(dayOfWeek);
  }
  if (facultyDbId) {
    sql += ` AND te.faculty_id = ?`;
    params.push(facultyDbId);
  }
  sql += ` ORDER BY te.day_of_week, te.start_time`;
  return query(sql, params);
}

export async function createTimetableEntry(data) {
  const {
    departmentId,
    semester,
    dayOfWeek,
    startTime,
    endTime,
    subjectName,
    facultyId,
    classroomId,
    section,
  } = data;
  if (
    !departmentId ||
    !dayOfWeek ||
    !startTime ||
    !endTime ||
    !subjectName ||
    !facultyId ||
    !classroomId
  ) {
    throw new AppError('Missing timetable fields');
  }
  const [result] = await pool.execute(
    `INSERT INTO timetable_entries
     (department_id, semester, day_of_week, start_time, end_time, subject_name, faculty_id, classroom_id, section)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      departmentId,
      semester || 1,
      dayOfWeek,
      startTime,
      endTime,
      subjectName,
      facultyId,
      classroomId,
      section || null,
    ]
  );
  return result.insertId;
}

export async function updateTimetableEntry(id, data) {
  const existing = await queryOne('SELECT * FROM timetable_entries WHERE id = ?', [id]);
  if (!existing) throw new AppError('Entry not found', 404);
  await query(
    `UPDATE timetable_entries SET
      department_id = COALESCE(?, department_id),
      semester = COALESCE(?, semester),
      day_of_week = COALESCE(?, day_of_week),
      start_time = COALESCE(?, start_time),
      end_time = COALESCE(?, end_time),
      subject_name = COALESCE(?, subject_name),
      faculty_id = COALESCE(?, faculty_id),
      classroom_id = COALESCE(?, classroom_id),
      section = COALESCE(?, section)
     WHERE id = ?`,
    [
      data.departmentId ?? existing.department_id,
      data.semester ?? existing.semester,
      data.dayOfWeek ?? existing.day_of_week,
      data.startTime ?? existing.start_time,
      data.endTime ?? existing.end_time,
      data.subjectName ?? existing.subject_name,
      data.facultyId ?? existing.faculty_id,
      data.classroomId ?? existing.classroom_id,
      data.section !== undefined ? data.section : existing.section,
      id,
    ]
  );
}

export async function deleteTimetableEntry(id) {
  await query('DELETE FROM timetable_entries WHERE id = ?', [id]);
}
