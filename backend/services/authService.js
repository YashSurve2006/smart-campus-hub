import bcrypt from 'bcryptjs';
import { pool, query, queryOne } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';

export async function registerUser(body) {
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
  if (!['student', 'faculty'].includes(role)) {
    throw new AppError('Invalid registration role');
  }
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters');
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
      if (!studentCode || !departmentId || !semester || !enrollmentYear) {
        throw new AppError('Student profile fields are required');
      }
      const dup = await queryOne('SELECT id FROM students WHERE student_code = ?', [studentCode]);
      if (dup) throw new AppError('Student code already exists');
      await conn.execute(
        `INSERT INTO students (user_id, student_code, department_id, semester, enrollment_year)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, studentCode, departmentId, semester, enrollmentYear]
      );
    } else if (role === 'faculty') {
      if (!employeeCode || !departmentId) {
        throw new AppError('Faculty profile fields are required');
      }
      const dup = await queryOne('SELECT id FROM faculty WHERE employee_code = ?', [employeeCode]);
      if (dup) throw new AppError('Employee code already exists');
      await conn.execute(
        `INSERT INTO faculty (user_id, employee_code, department_id, designation)
         VALUES (?, ?, ?, ?)`,
        [userId, employeeCode, departmentId, designation || 'Faculty']
      );
    }

    await conn.commit();
    return { userId, role };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function loginUser(email, password) {
  const user = await queryOne(
    `SELECT id, email, password_hash, role, first_name, last_name, phone, avatar_url
     FROM users WHERE email = ?`,
    [email]
  );
  if (!user) throw new AppError('Invalid credentials', 401);

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new AppError('Invalid credentials', 401);

  await pool.execute(`UPDATE users SET last_login_at = NOW() WHERE id = ?`, [user.id]);

  const token = signToken({ sub: user.id, role: user.role });
  const fullProfile = await getUserProfile(user.id);
  return { token, user: fullProfile };
}

export async function getUserProfile(userId) {
  const user = await queryOne(
    `SELECT id, email, role, first_name, last_name, phone, avatar_url, created_at, last_login_at
     FROM users WHERE id = ?`,
    [userId]
  );
  if (!user) throw new AppError('User not found', 404);

  let profile = null;
  if (user.role === 'student') {
    const row = await queryOne(
      `SELECT s.id, s.student_code, s.semester, s.enrollment_year,
              d.id AS dept_id, d.name AS dept_name, d.code AS dept_code
       FROM students s
       JOIN departments d ON d.id = s.department_id
       WHERE s.user_id = ?`,
      [userId]
    );
    if (row) {
      profile = {
        studentDbId: row.id,
        studentCode: row.student_code,
        semester: row.semester,
        enrollmentYear: row.enrollment_year,
        departmentId: row.dept_id,
        departmentName: row.dept_name,
        departmentCode: row.dept_code,
      };
    }
  } else if (user.role === 'faculty') {
    const row = await queryOne(
      `SELECT f.id, f.employee_code, f.designation, f.specialization,
              d.id AS dept_id, d.name AS dept_name, d.code AS dept_code
       FROM faculty f
       JOIN departments d ON d.id = f.department_id
       WHERE f.user_id = ?`,
      [userId]
    );
    if (row) {
      profile = {
        facultyDbId: row.id,
        employeeCode: row.employee_code,
        designation: row.designation,
        specialization: row.specialization,
        departmentId: row.dept_id,
        departmentName: row.dept_name,
        departmentCode: row.dept_code,
      };
    }
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    avatarUrl: user.avatar_url,
    createdAt: user.created_at,
    lastLoginAt: user.last_login_at,
    profile,
  };
}
