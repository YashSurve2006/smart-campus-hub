import { pool, query, queryOne } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import bcrypt from 'bcryptjs';

export async function platformStats() {
  const [students, faculty, notices, departments] = await Promise.all([
    queryOne(`SELECT COUNT(*) AS c FROM students`),
    queryOne(`SELECT COUNT(*) AS c FROM faculty`),
    queryOne(`SELECT COUNT(*) AS c FROM notices WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`),
    queryOne(`SELECT COUNT(*) AS c FROM departments`),
  ]);
  return {
    totalStudents: Number(students.c),
    totalFaculty: Number(faculty.c),
    noticesLast30Days: Number(notices.c),
    departments: Number(departments.c),
  };
}

export async function listStudents({ search, departmentId, page = 1, limit = 20 }) {
  const rawPage = Number.parseInt(page, 10);
  const safePage = Math.max(1, Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1);

  const rawLimit = Number.parseInt(limit, 10);
  let lim = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 20;
  if (!Number.isFinite(lim) || lim <= 0) lim = 20;
  lim = Math.max(1, Math.min(100, lim));

  lim = Math.trunc(lim);
  const off = Math.trunc((safePage - 1) * lim);
  let sql = `
    SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at,
           s.id AS student_db_id, s.student_code, s.semester, s.enrollment_year,
           d.name AS department_name, d.id AS department_id
    FROM users u
    JOIN students s ON s.user_id = u.id
    JOIN departments d ON d.id = s.department_id
    WHERE u.role = 'student'
  `;
  const params = [];
  if (search) {
    sql += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR s.student_code LIKE ?)`;
    const q = `%${search}%`;
    params.push(q, q, q, q);
  }
  if (departmentId) {
    sql += ` AND s.department_id = ?`;
    params.push(departmentId);
  }
  // NOTE: MySQL doesn't accept bound placeholders for LIMIT/OFFSET in this project setup.
  // We interpolate only validated integers to avoid ER_WRONG_ARGUMENTS.
  sql += ` ORDER BY u.created_at DESC LIMIT ${lim} OFFSET ${off}`;
  const rows = await query(sql, params);

  let countSql = `
    SELECT COUNT(*) AS c FROM users u
    JOIN students s ON s.user_id = u.id
    WHERE u.role = 'student'
  `;
  const countParams = [];
  if (search) {
    countSql += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR s.student_code LIKE ?)`;
    const q = `%${search}%`;
    countParams.push(q, q, q, q);
  }
  if (departmentId) {
    countSql += ` AND s.department_id = ?`;
    countParams.push(departmentId);
  }
  const [{ c }] = await query(countSql, countParams);
  return { rows, total: Number(c), page: safePage, limit: lim };
}

export async function listFacultyMembers({ search, departmentId, page = 1, limit = 20 }) {
  const rawPage = Number.parseInt(page, 10);
  const safePage = Math.max(1, Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1);

  const rawLimit = Number.parseInt(limit, 10);
  let lim = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 20;
  if (!Number.isFinite(lim) || lim <= 0) lim = 20;
  lim = Math.max(1, Math.min(100, lim));

  lim = Math.trunc(lim);
  const off = Math.trunc((safePage - 1) * lim);
  let sql = `
    SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at,
           f.id AS faculty_db_id, f.employee_code, f.designation,
           d.name AS department_name, d.id AS department_id
    FROM users u
    JOIN faculty f ON f.user_id = u.id
    JOIN departments d ON d.id = f.department_id
    WHERE u.role = 'faculty'
  `;
  const params = [];
  if (search) {
    sql += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR f.employee_code LIKE ?)`;
    const q = `%${search}%`;
    params.push(q, q, q, q);
  }
  if (departmentId) {
    sql += ` AND f.department_id = ?`;
    params.push(departmentId);
  }
  // NOTE: MySQL doesn't accept bound placeholders for LIMIT/OFFSET in this project setup.
  // We interpolate only validated integers to avoid ER_WRONG_ARGUMENTS.
  sql += ` ORDER BY u.created_at DESC LIMIT ${lim} OFFSET ${off}`;
  const rows = await query(sql, params);

  let countSql = `
    SELECT COUNT(*) AS c FROM users u
    JOIN faculty f ON f.user_id = u.id
    WHERE u.role = 'faculty'
  `;
  const countParams = [];
  if (search) {
    countSql += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR f.employee_code LIKE ?)`;
    const q = `%${search}%`;
    countParams.push(q, q, q, q);
  }
  if (departmentId) {
    countSql += ` AND f.department_id = ?`;
    countParams.push(departmentId);
  }
  const [{ c }] = await query(countSql, countParams);
  return { rows, total: Number(c), page: safePage, limit: lim };
}

export async function updateStudentUser(userId, data) {
  const row = await queryOne(
    `SELECT u.id FROM users u JOIN students s ON s.user_id = u.id WHERE u.id = ?`,
    [userId]
  );
  if (!row) throw new AppError('Student not found', 404);

  if (data.firstName || data.lastName || data.phone !== undefined) {
    await query(
      `UPDATE users SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        phone = ?
       WHERE id = ?`,
      [data.firstName, data.lastName, data.phone ?? null, userId]
    );
  }
  if (
    data.semester !== undefined ||
    data.departmentId !== undefined ||
    data.studentCode !== undefined
  ) {
    await query(
      `UPDATE students SET
        semester = COALESCE(?, semester),
        department_id = COALESCE(?, department_id),
        student_code = COALESCE(?, student_code)
       WHERE user_id = ?`,
      [data.semester, data.departmentId, data.studentCode, userId]
    );
  }
}

export async function updateFacultyUser(userId, data) {
  const row = await queryOne(
    `SELECT u.id FROM users u JOIN faculty f ON f.user_id = u.id WHERE u.id = ?`,
    [userId]
  );
  if (!row) throw new AppError('Faculty not found', 404);

  if (data.firstName || data.lastName || data.phone !== undefined) {
    await query(
      `UPDATE users SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        phone = ?
       WHERE id = ?`,
      [data.firstName, data.lastName, data.phone ?? null, userId]
    );
  }
  if (
    data.designation ||
    data.departmentId !== undefined ||
    data.employeeCode !== undefined ||
    data.specialization !== undefined
  ) {
    await query(
      `UPDATE faculty SET
        designation = COALESCE(?, designation),
        department_id = COALESCE(?, department_id),
        employee_code = COALESCE(?, employee_code),
        specialization = COALESCE(?, specialization)
       WHERE user_id = ?`,
      [
        data.designation,
        data.departmentId,
        data.employeeCode,
        data.specialization === undefined ? null : data.specialization,
        userId,
      ]
    );
  }
}

export async function adminCreateUser(body) {
  const {
    email,
    password,
    firstName,
    lastName,
    role,
    phone,
    studentCode,
    departmentId,
    semester,
    enrollmentYear,
    employeeCode,
    designation,
  } = body;

  if (!email || !password || !firstName || !lastName || !role) {
    throw new AppError('Missing required fields');
  }
  if (!['student', 'faculty', 'admin'].includes(role)) {
    throw new AppError('Invalid role');
  }

  const existing = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) throw new AppError('Email already registered');

  const passwordHash = await bcrypt.hash(password, 12);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [userResult] = await conn.execute(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, role, firstName, lastName, phone || null]
    );
    const userId = userResult.insertId;

    if (role === 'student') {
      await conn.execute(
        `INSERT INTO students (user_id, student_code, department_id, semester, enrollment_year)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, studentCode, departmentId, semester || 1, enrollmentYear || new Date().getFullYear()]
      );
    } else if (role === 'faculty') {
      await conn.execute(
        `INSERT INTO faculty (user_id, employee_code, department_id, designation)
         VALUES (?, ?, ?, ?)`,
        [userId, employeeCode, departmentId, designation || 'Faculty']
      );
    }

    await conn.commit();
    return { userId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
