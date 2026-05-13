import { query, queryOne } from '../config/db.js';
import * as adminService from './adminService.js';
import * as analyticsService from './analyticsService.js';

function dayOfWeekMondayFirst(d = new Date()) {
  const js = d.getDay();
  return js === 0 ? 7 : js;
}

export async function studentDashboard(userId) {
  const student = await queryOne(
    `SELECT s.id, s.semester, s.department_id
     FROM students s WHERE s.user_id = ?`,
    [userId]
  );
  if (!student) return null;

  const summary = await queryOne(
    `SELECT
       SUM(CASE WHEN status IN ('present','late') THEN 1 ELSE 0 END) AS ok,
       COUNT(*) AS total
     FROM attendance_records WHERE student_id = ?`,
    [student.id]
  );
  const total = Number(summary?.total || 0);
  const ok = Number(summary?.ok || 0);
  const attendancePct = total === 0 ? 0 : Math.round((ok / total) * 1000) / 10;

  let notices = [];
  try {
    notices = await query(
      `SELECT n.id, n.title, n.created_at, n.priority, n.notice_category,
              u.first_name, u.last_name,
              (SELECT COUNT(*) FROM notice_attachments na WHERE na.notice_id = n.id) AS attachment_count,
              (nr.notice_id IS NOT NULL) AS is_read
       FROM notices n
       JOIN users u ON u.id = n.author_id
       LEFT JOIN notice_reads nr ON nr.notice_id = n.id AND nr.user_id = ?
       WHERE n.target_role IN ('all','student')
       ORDER BY n.created_at DESC
       LIMIT 5`,
      [userId]
    );
  } catch {
    try {
      notices = await query(
        `SELECT n.id, n.title, n.created_at, u.first_name, u.last_name
         FROM notices n
         JOIN users u ON u.id = n.author_id
         WHERE n.target_role IN ('all','student')
         ORDER BY n.created_at DESC
         LIMIT 5`
      );
    } catch {
      notices = [];
    }
  }

  const dow = dayOfWeekMondayFirst();
  const todayClasses = await query(
    `SELECT te.subject_name, te.start_time, te.end_time, c.name AS room, c.building
     FROM timetable_entries te
     JOIN classrooms c ON c.id = te.classroom_id
     WHERE te.department_id = ? AND te.semester = ? AND te.day_of_week = ?
     ORDER BY te.start_time`,
    [student.department_id, student.semester, dow]
  );

  let campusEventBanners = [];
  try {
    campusEventBanners = await query(
      `SELECT id, title, starts_at, location, category, is_featured
       FROM campus_events
       WHERE ends_at >= NOW() AND target_role IN ('all','student')
       ORDER BY is_featured DESC, starts_at ASC
       LIMIT 5`
    );
  } catch {
    /* campus_events may not exist on unmigrated DB */
  }

  let noticeHighlights = [];
  try {
    noticeHighlights = await query(
      `SELECT id, title, created_at, priority FROM notices
       WHERE target_role IN ('all','student')
       ORDER BY created_at DESC
       LIMIT 3`
    );
  } catch {
    noticeHighlights = await query(
      `SELECT id, title, created_at FROM notices
       WHERE target_role IN ('all','student')
       ORDER BY created_at DESC
       LIMIT 3`
    );
  }

  let unreadNotices = 0;
  try {
    const u = await queryOne(
      `SELECT COUNT(*) AS c FROM notices n
       LEFT JOIN notice_reads nr ON nr.notice_id = n.id AND nr.user_id = ?
       WHERE n.target_role IN ('all','student') AND nr.notice_id IS NULL`,
      [userId]
    );
    unreadNotices = Number(u?.c || 0);
  } catch {
    unreadNotices = 0;
  }

  return {
    attendancePct,
    notices,
    todayClasses,
    upcomingEvents: campusEventBanners,
    noticeHighlights,
    unreadNotices,
  };
}

export async function facultyDashboard(userId) {
  const faculty = await queryOne(`SELECT id FROM faculty WHERE user_id = ?`, [userId]);
  if (!faculty) return null;

  const myClasses = await query(
    `SELECT COUNT(*) AS c FROM timetable_entries WHERE faculty_id = ?`,
    [faculty.id]
  );
  const noticesPosted = await query(
    `SELECT COUNT(*) AS c FROM notices WHERE author_id = ?`,
    [userId]
  );
  const pendingAttendance = await queryOne(
    `SELECT COUNT(DISTINCT te.id) AS c
     FROM timetable_entries te
     WHERE te.faculty_id = ?
       AND NOT EXISTS (
         SELECT 1 FROM attendance_records ar
         WHERE ar.timetable_entry_id = te.id AND ar.attendance_date = CURDATE()
       )`,
    [faculty.id]
  );

  return {
    classCount: Number(myClasses[0]?.c || 0),
    noticesPosted: Number(noticesPosted[0]?.c || 0),
    slotsWithoutTodayAttendance: Number(pendingAttendance?.c || 0),
  };
}

export async function adminCommandCenter() {
  const stats = await adminService.platformStats();
  let recentAudit = [];
  let recentActivity = [];
  let recentUploads = [];
  let registrationTrend = [];
  let eventParticipation = [];
  let activeUsersWeek = 0;

  try {
    recentAudit = await query(
      `SELECT a.*, u.email AS actor_email
       FROM audit_logs a
       LEFT JOIN users u ON u.id = a.user_id
       ORDER BY a.created_at DESC
       LIMIT 14`
    );
  } catch {
    /* */
  }
  try {
    recentActivity = await query(
      `SELECT a.*, u.first_name, u.last_name, u.email
       FROM activity_logs a
       JOIN users u ON u.id = a.user_id
       ORDER BY a.created_at DESC
       LIMIT 14`
    );
  } catch {
    /* */
  }
  try {
    recentUploads = await query(
      `SELECT uf.*, u.email FROM uploaded_files uf JOIN users u ON u.id = uf.user_id
       ORDER BY uf.created_at DESC LIMIT 10`
    );
  } catch {
    /* */
  }
  try {
    registrationTrend = await analyticsService.registrationTrend();
    eventParticipation = await analyticsService.topEventsByRegistrations(8);
  } catch {
    /* */
  }
  try {
    const row = await queryOne(
      `SELECT COUNT(DISTINCT user_id) AS c FROM activity_logs
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );
    activeUsersWeek = Number(row?.c || 0);
  } catch {
    activeUsersWeek = 0;
  }

  return {
    ...stats,
    recentAudit,
    recentActivity,
    recentUploads,
    registrationTrend,
    eventParticipation,
    activeUsersWeek,
  };
}
