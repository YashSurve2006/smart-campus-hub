/**
 * Centralized Socket.IO broadcast helpers for dashboard and domain events.
 */
import { SOCKET_EVENTS } from './events.js';
import { query } from '../config/db.js';

export function broadcastDashboardRefresh(io, payload = {}) {
  io?.emit(SOCKET_EVENTS.dashboardRefresh, { at: Date.now(), ...payload });
}

export function broadcastNoticeCreated(io, notice) {
  io?.emit(SOCKET_EVENTS.noticeCreated, { notice, at: Date.now() });
  broadcastDashboardRefresh(io, { reason: 'notice' });
}

export function broadcastEventCreated(io, event) {
  io?.emit(SOCKET_EVENTS.eventCreated, { event, at: Date.now() });
  broadcastDashboardRefresh(io, { reason: 'event' });
}

export function broadcastUserDirectoryChanged(io, payload) {
  io?.emit(SOCKET_EVENTS.usersChanged, { at: Date.now(), ...payload });
  broadcastDashboardRefresh(io, { reason: 'users' });
}

export function broadcastAttendanceUpdated(io, payload) {
  io?.emit(SOCKET_EVENTS.attendanceUpdated, { at: Date.now(), ...payload });
  broadcastDashboardRefresh(io, { reason: 'attendance' });
}

export function notifyUser(io, userId, eventName, payload) {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit(eventName, { at: Date.now(), ...payload });
}

export async function broadcastAssignmentPublished(io, assignment) {
  io?.emit(SOCKET_EVENTS.assignmentPublished, { assignment, at: Date.now() });
  broadcastDashboardRefresh(io, { reason: 'assignment' });

  // Notify eligible students
  const students = await query(
    `SELECT user_id 
     FROM students 
     WHERE department_id = ? AND semester = ?`,
    [assignment.department_id, assignment.semester]
  );
  for (const s of students) {
    notifyUser(io, s.user_id, SOCKET_EVENTS.assignmentPublished, { assignment });
  }
}

export function broadcastSubmissionCreated(io, submission, facultyUserId) {
  notifyUser(io, facultyUserId, SOCKET_EVENTS.submissionCreated, { submission });
  broadcastDashboardRefresh(io, { reason: 'submission' });
}

export function broadcastSubmissionGraded(io, submission, studentUserId) {
  notifyUser(io, studentUserId, SOCKET_EVENTS.submissionGraded, { submission });
  broadcastDashboardRefresh(io, { reason: 'submission' });
}
