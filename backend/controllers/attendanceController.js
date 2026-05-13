import { asyncHandler } from '../utils/asyncHandler.js';
import { queryOne } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import * as attendanceService from '../services/attendanceService.js';
import { broadcastAttendanceUpdated } from '../realtime/socketHub.js';

async function getStudentDbId(userId) {
  const s = await queryOne(`SELECT id FROM students WHERE user_id = ?`, [userId]);
  if (!s) throw new AppError('Student profile not found', 403);
  return s.id;
}

export const mySummary = asyncHandler(async (req, res) => {
  const sid = await getStudentDbId(req.user.id);
  const summary = await attendanceService.studentAttendanceSummary(sid);
  res.json({ success: true, summary });
});

export const myRecords = asyncHandler(async (req, res) => {
  const sid = await getStudentDbId(req.user.id);
  const rows = await attendanceService.listStudentAttendance(sid, req.query);
  res.json({ success: true, records: rows });
});

export const roster = asyncHandler(async (req, res) => {
  const rows = await attendanceService.studentsForTimetableEntry(
    req.params.timetableId,
    null
  );
  res.json({ success: true, students: rows });
});

export const mark = asyncHandler(async (req, res) => {
  const { timetableEntryId, attendanceDate, records } = req.body;
  await attendanceService.markAttendance({
    timetableEntryId,
    attendanceDate,
    records,
    markedByUserId: req.user.id,
    facultyUserId: req.user.id,
  });
  broadcastAttendanceUpdated(req.app.get('io'), { timetableEntryId, attendanceDate });
  res.json({ success: true });
});
