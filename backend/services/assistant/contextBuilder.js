import { query, queryOne } from '../../config/db.js';
import * as dashboardService from '../dashboardService.js';

function dowMondayFirst(d = new Date()) {
  const js = d.getDay();
  return js === 0 ? 7 : js;
}

export async function buildCampusDataContext(userId, role) {
  const suggestions = [
    'Show today timetable',
    'Latest notices',
    'Upcoming events',
    'Attendance summary',
    'Open campus map',
  ];

  let todayClasses = [];
  let attendanceSummary = null;
  let profileSnippet = null;

  if (role === 'student') {
    const dash = await dashboardService.studentDashboard(userId);
    if (dash) {
      todayClasses = dash.todayClasses || [];
      const r = await queryOne(
        `SELECT COUNT(*) AS c FROM attendance_records ar
         JOIN students s ON s.id = ar.student_id WHERE s.user_id = ?`,
        [userId]
      );
      attendanceSummary = {
        attendancePct: dash.attendancePct,
        recordedSessions: Number(r?.c || 0),
      };
    }
    const stu = await queryOne(
      `SELECT s.semester, d.name AS dept FROM students s JOIN departments d ON d.id = s.department_id WHERE s.user_id = ?`,
      [userId]
    );
    if (stu) profileSnippet = { semester: stu.semester, department: stu.dept };
  } else if (role === 'faculty') {
    const fac = await queryOne(`SELECT id FROM faculty WHERE user_id = ?`, [userId]);
    if (fac) {
      const dow = dowMondayFirst();
      todayClasses = await query(
        `SELECT te.subject_name, te.start_time, te.end_time, c.building, c.name AS room, te.day_of_week
         FROM timetable_entries te
         JOIN classrooms c ON c.id = te.classroom_id
         WHERE te.faculty_id = ? AND te.day_of_week = ?
         ORDER BY te.start_time`,
        [fac.id, dow]
      );
    }
    const fdash = await dashboardService.facultyDashboard(userId);
    if (fdash) {
      attendanceSummary = {
        classCount: fdash.classCount,
        noticesPosted: fdash.noticesPosted,
        slotsWithoutTodayAttendance: fdash.slotsWithoutTodayAttendance,
      };
    }
  }

  const vis =
    role === 'student'
      ? `n.target_role IN ('all','student')`
      : role === 'faculty'
        ? `n.target_role IN ('all','faculty')`
        : '1=1';

  let recentNotices = [];
  try {
    recentNotices = await query(
      `SELECT n.id, n.title, n.created_at, n.priority, n.notice_category
       FROM notices n WHERE ${vis}
       ORDER BY n.created_at DESC LIMIT 6`
    );
  } catch {
    recentNotices = await query(
      `SELECT n.id, n.title, n.created_at, 'normal' AS priority, 'general' AS notice_category
       FROM notices n WHERE ${vis}
       ORDER BY n.created_at DESC LIMIT 6`
    );
  }

  const visEv =
    role === 'student'
      ? `e.target_role IN ('all','student')`
      : role === 'faculty'
        ? `e.target_role IN ('all','faculty')`
        : '1=1';

  let upcomingEvents = [];
  try {
    upcomingEvents = await query(
      `SELECT e.id, e.title, e.starts_at, e.location, e.category
       FROM campus_events e
       WHERE e.ends_at >= NOW() AND ${visEv}
       ORDER BY e.starts_at ASC LIMIT 6`
    );
  } catch {
    upcomingEvents = [];
  }

  return {
    role,
    suggestions,
    todayClasses,
    recentNotices,
    upcomingEvents,
    attendanceSummary,
    profileSnippet,
    generatedAt: new Date().toISOString(),
  };
}
