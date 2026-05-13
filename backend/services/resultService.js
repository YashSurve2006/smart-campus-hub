import { pool, query, queryOne } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { classifyDivision, computeCgpa, computeSgpa, evaluateResult } from '../utils/resultCalculator.js';

async function getFacultyByUser(userId) {
  return queryOne(`SELECT id, department_id FROM faculty WHERE user_id = ?`, [userId]);
}

export async function listSubjects({ departmentId, semester }) {
  return query(
    `SELECT id, code, name, credits, semester, department_id, total_marks, passing_marks
     FROM subjects
     WHERE (? IS NULL OR department_id = ?)
       AND (? IS NULL OR semester = ?)
     ORDER BY semester, code`,
    [departmentId ?? null, departmentId ?? null, semester ?? null, semester ?? null]
  );
}

export async function listResultEntries({ departmentId, semester, subjectId, examType, search }) {
  const like = search ? `%${search}%` : null;
  return query(
    `SELECT r.id, r.student_id, r.subject_id, r.semester, r.exam_type, r.marks_obtained, r.total_marks,
            r.grade, r.grade_point, r.remarks, r.status, r.locked, r.updated_at,
            s.student_code, u.first_name, u.last_name, sub.code AS subject_code, sub.name AS subject_name
     FROM results r
     JOIN students s ON s.id = r.student_id
     JOIN users u ON u.id = s.user_id
     JOIN subjects sub ON sub.id = r.subject_id
     WHERE (? IS NULL OR s.department_id = ?)
       AND (? IS NULL OR r.semester = ?)
       AND (? IS NULL OR r.subject_id = ?)
       AND (? IS NULL OR r.exam_type = ?)
       AND (? IS NULL OR (u.first_name LIKE ? OR u.last_name LIKE ? OR s.student_code LIKE ?))
     ORDER BY u.first_name, u.last_name`,
    [
      departmentId ?? null,
      departmentId ?? null,
      semester ?? null,
      semester ?? null,
      subjectId ?? null,
      subjectId ?? null,
      examType ?? null,
      examType ?? null,
      like,
      like,
      like,
      like,
    ]
  );
}

export async function upsertMarksBatch({ userId, departmentId, semester, subjectId, examType, rows }) {
  const faculty = await getFacultyByUser(userId);
  if (!faculty) throw new AppError('Faculty profile not found', 403);
  if (!Array.isArray(rows) || rows.length === 0) throw new AppError('No marks payload provided', 400);
  if (faculty.department_id !== Number(departmentId)) {
    throw new AppError('You can upload marks only for your department', 403);
  }

  const subject = await queryOne(
    `SELECT id, total_marks, passing_marks, credits FROM subjects WHERE id = ? AND department_id = ? AND semester = ?`,
    [subjectId, departmentId, semester]
  );
  if (!subject) throw new AppError('Subject not found for selected semester/department', 404);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const row of rows) {
      const studentId = Number(row.studentId);
      const marksObtained = Number(row.marksObtained);
      if (!studentId || Number.isNaN(marksObtained)) continue;

      const student = await conn.execute(
        `SELECT id FROM students WHERE id = ? AND department_id = ? AND semester = ?`,
        [studentId, departmentId, semester]
      );
      if (!student[0]?.length) continue;

      const evalResult = evaluateResult({
        marksObtained,
        totalMarks: subject.total_marks,
        passingMarks: subject.passing_marks,
      });

      await conn.execute(
        `INSERT INTO results
         (student_id, subject_id, faculty_id, semester, exam_type, marks_obtained, total_marks, percentage, grade, grade_point, remarks, status, locked)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE
           marks_obtained = IF(locked = 1, marks_obtained, VALUES(marks_obtained)),
           total_marks = IF(locked = 1, total_marks, VALUES(total_marks)),
           percentage = IF(locked = 1, percentage, VALUES(percentage)),
           grade = IF(locked = 1, grade, VALUES(grade)),
           grade_point = IF(locked = 1, grade_point, VALUES(grade_point)),
           remarks = IF(locked = 1, remarks, VALUES(remarks)),
           status = IF(locked = 1, status, VALUES(status)),
           updated_at = CURRENT_TIMESTAMP`,
        [
          studentId,
          subjectId,
          faculty.id,
          semester,
          examType,
          marksObtained,
          subject.total_marks,
          evalResult.percentage,
          evalResult.grade,
          evalResult.gradePoint,
          row.remarks || null,
          evalResult.status,
        ]
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return recomputeSemesterGpa({ departmentId, semester });
}

export async function recomputeSemesterGpa({ departmentId, semester }) {
  const students = await query(
    `SELECT id FROM students WHERE department_id = ? AND semester = ?`,
    [departmentId, semester]
  );
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const st of students) {
      const gradeRows = await conn.execute(
        `SELECT r.grade_point, sub.credits
         FROM results r
         JOIN subjects sub ON sub.id = r.subject_id
         WHERE r.student_id = ? AND r.semester = ?`,
        [st.id, semester]
      );
      const { sgpa, totalCredits } = computeSgpa(gradeRows[0]);
      await conn.execute(
        `INSERT INTO cgpa_records (student_id, semester, sgpa, cgpa, total_credits)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE sgpa = VALUES(sgpa), total_credits = VALUES(total_credits), updated_at = CURRENT_TIMESTAMP`,
        [st.id, semester, sgpa, sgpa, totalCredits]
      );
      const allSem = await conn.execute(
        `SELECT semester, sgpa, total_credits FROM cgpa_records WHERE student_id = ? ORDER BY semester`,
        [st.id]
      );
      const cgpa = computeCgpa(allSem[0]);
      await conn.execute(`UPDATE cgpa_records SET cgpa = ? WHERE student_id = ? AND semester = ?`, [
        cgpa,
        st.id,
        semester,
      ]);
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function publishSemester({ departmentId, semester, published, userId }) {
  await query(
    `INSERT INTO result_publications (semester, department_id, published, published_at, published_by)
     VALUES (?, ?, ?, IF(? = 1, NOW(), NULL), ?)
     ON DUPLICATE KEY UPDATE
       published = VALUES(published),
       published_at = IF(VALUES(published) = 1, NOW(), NULL),
       published_by = VALUES(published_by)`,
    [semester, departmentId, published ? 1 : 0, published ? 1 : 0, userId]
  );
}

export async function lockResults({ departmentId, semester, examType, lock }) {
  await query(
    `UPDATE results r
     JOIN students s ON s.id = r.student_id
     SET r.locked = ?
     WHERE s.department_id = ? AND r.semester = ? AND (? IS NULL OR r.exam_type = ?)`,
    [lock ? 1 : 0, departmentId, semester, examType ?? null, examType ?? null]
  );
}

export async function getStudentResultPortal(userId) {
  const student = await queryOne(
    `SELECT s.id, s.department_id, s.student_code, u.first_name, u.last_name, d.name AS department_name
     FROM students s
     JOIN users u ON u.id = s.user_id
     JOIN departments d ON d.id = s.department_id
     WHERE s.user_id = ?`,
    [userId]
  );
  if (!student) throw new AppError('Student profile not found', 404);

  const semesters = await query(
    `SELECT cr.semester, cr.sgpa, cr.cgpa, cr.total_credits,
            rp.published, rp.published_at
     FROM cgpa_records cr
     LEFT JOIN result_publications rp
       ON rp.semester = cr.semester AND rp.department_id = ?
     WHERE cr.student_id = ?
     ORDER BY cr.semester`,
    [student.department_id, student.id]
  );

  const subjects = await query(
    `SELECT r.id, r.semester, r.exam_type, r.marks_obtained, r.total_marks, r.percentage, r.grade, r.status, r.remarks,
            sub.code, sub.name, sub.credits
     FROM results r
     JOIN subjects sub ON sub.id = r.subject_id
     LEFT JOIN result_publications rp
       ON rp.semester = r.semester AND rp.department_id = ?
     WHERE r.student_id = ? AND COALESCE(rp.published, 0) = 1
     ORDER BY r.semester, sub.code`,
    [student.department_id, student.id]
  );

  const latestCgpa = semesters.length ? Number(semesters[semesters.length - 1].cgpa || 0) : 0;
  const latestSem = semesters.length ? Number(semesters[semesters.length - 1].semester) : null;
  let rank = null;
  if (latestSem) {
    const rankRows = await query(
      `SELECT ranked.student_id, ranked.rnk
       FROM (
         SELECT t.student_id,
                DENSE_RANK() OVER (ORDER BY t.avg_pct DESC) AS rnk
         FROM (
           SELECT r.student_id, AVG(r.percentage) AS avg_pct
           FROM results r
           JOIN students s ON s.id = r.student_id
           WHERE s.department_id = ? AND r.semester = ?
           GROUP BY r.student_id
         ) t
       ) ranked
       WHERE ranked.student_id = ?`,
      [student.department_id, latestSem, student.id]
    );
    rank = rankRows[0]?.rnk ?? null;
  }
  return {
    student,
    semesters,
    subjects,
    summary: { cgpa: latestCgpa, division: classifyDivision(latestCgpa), rank },
  };
}

export async function getFacultyAnalytics({ departmentId, semester }) {
  const [overview] = await query(
    `SELECT
      COUNT(*) AS total_entries,
      ROUND(AVG(percentage), 2) AS avg_percentage,
      ROUND(SUM(CASE WHEN status='pass' THEN 1 ELSE 0 END) * 100 / NULLIF(COUNT(*),0), 2) AS pass_percentage
     FROM results r
     JOIN students s ON s.id = r.student_id
     WHERE s.department_id = ? AND r.semester = ?`,
    [departmentId, semester]
  );

  const gradeDistribution = await query(
    `SELECT grade, COUNT(*) AS count
     FROM results r
     JOIN students s ON s.id = r.student_id
     WHERE s.department_id = ? AND r.semester = ?
     GROUP BY grade
     ORDER BY FIELD(grade, 'O','A+','A','B+','B','C','F')`,
    [departmentId, semester]
  );

  const topper = await query(
    `SELECT s.id AS student_id, s.student_code, u.first_name, u.last_name, ROUND(AVG(r.percentage),2) AS avg_percentage
     FROM results r
     JOIN students s ON s.id = r.student_id
     JOIN users u ON u.id = s.user_id
     WHERE s.department_id = ? AND r.semester = ?
     GROUP BY s.id, s.student_code, u.first_name, u.last_name
     ORDER BY avg_percentage DESC
     LIMIT 5`,
    [departmentId, semester]
  );

  const subjectStats = await query(
    `SELECT sub.code, sub.name, ROUND(AVG(r.percentage),2) AS average_percentage,
            SUM(CASE WHEN r.status='fail' THEN 1 ELSE 0 END) AS failures
     FROM results r
     JOIN subjects sub ON sub.id = r.subject_id
     JOIN students s ON s.id = r.student_id
     WHERE s.department_id = ? AND r.semester = ?
     GROUP BY sub.id, sub.code, sub.name
     ORDER BY sub.code`,
    [departmentId, semester]
  );

  return { overview: overview ?? {}, gradeDistribution, topper, subjectStats };
}
