import { asyncHandler } from '../utils/asyncHandler.js';
import { queryOne } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import * as timetableService from '../services/timetableService.js';

async function assertFacultyOwnsEntry(userId, entryId) {
  const f = await queryOne(`SELECT id FROM faculty WHERE user_id = ?`, [userId]);
  if (!f) throw new AppError('Faculty profile not found', 403);
  const row = await queryOne(`SELECT faculty_id FROM timetable_entries WHERE id = ?`, [entryId]);
  if (!row) throw new AppError('Entry not found', 404);
  if (row.faculty_id !== f.id) throw new AppError('You can only modify your own classes', 403);
}

export const list = asyncHandler(async (req, res) => {
  const { departmentId, semester, dayOfWeek, mine } = req.query;
  let facultyDbId;
  if (mine === '1' && req.user.role === 'faculty') {
    const f = await queryOne(`SELECT id FROM faculty WHERE user_id = ?`, [req.user.id]);
    facultyDbId = f?.id;
  }
  const rows = await timetableService.listTimetable({
    departmentId: departmentId ? Number(departmentId) : undefined,
    semester: semester ? Number(semester) : undefined,
    dayOfWeek: dayOfWeek ? Number(dayOfWeek) : undefined,
    facultyDbId,
  });
  res.json({ success: true, entries: rows });
});

export const create = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.user.role === 'faculty') {
    const f = await queryOne(`SELECT id FROM faculty WHERE user_id = ?`, [req.user.id]);
    if (!f) throw new AppError('Faculty profile not found', 403);
    payload.facultyId = f.id;
  }
  const id = await timetableService.createTimetableEntry(payload);
  res.status(201).json({ success: true, id });
});

export const update = asyncHandler(async (req, res) => {
  if (req.user.role === 'faculty') {
    await assertFacultyOwnsEntry(req.user.id, req.params.id);
  }
  await timetableService.updateTimetableEntry(req.params.id, req.body);
  res.json({ success: true });
});

export const remove = asyncHandler(async (req, res) => {
  if (req.user.role === 'faculty') {
    await assertFacultyOwnsEntry(req.user.id, req.params.id);
  }
  await timetableService.deleteTimetableEntry(req.params.id);
  res.json({ success: true });
});
