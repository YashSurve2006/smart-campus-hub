import { asyncHandler } from '../utils/asyncHandler.js';
import * as resultService from '../services/resultService.js';

export const subjects = asyncHandler(async (req, res) => {
  const data = await resultService.listSubjects({
    departmentId: req.query.departmentId ? Number(req.query.departmentId) : null,
    semester: req.query.semester ? Number(req.query.semester) : null,
  });
  res.json({ success: true, subjects: data });
});

export const listFacultyEntries = asyncHandler(async (req, res) => {
  const rows = await resultService.listResultEntries({
    departmentId: req.query.departmentId ? Number(req.query.departmentId) : null,
    semester: req.query.semester ? Number(req.query.semester) : null,
    subjectId: req.query.subjectId ? Number(req.query.subjectId) : null,
    examType: req.query.examType || null,
    search: req.query.search || null,
  });
  res.json({ success: true, results: rows });
});

export const upsertMarks = asyncHandler(async (req, res) => {
  const payload = req.body;
  await resultService.upsertMarksBatch({
    userId: req.user.id,
    departmentId: Number(payload.departmentId),
    semester: Number(payload.semester),
    subjectId: Number(payload.subjectId),
    examType: payload.examType,
    rows: payload.rows,
  });
  res.json({ success: true, message: 'Marks saved successfully' });
});

export const publish = asyncHandler(async (req, res) => {
  await resultService.publishSemester({
    departmentId: Number(req.body.departmentId),
    semester: Number(req.body.semester),
    published: Boolean(req.body.published),
    userId: req.user.id,
  });
  res.json({ success: true });
});

export const lock = asyncHandler(async (req, res) => {
  await resultService.lockResults({
    departmentId: Number(req.body.departmentId),
    semester: Number(req.body.semester),
    examType: req.body.examType || null,
    lock: Boolean(req.body.lock),
  });
  res.json({ success: true });
});

export const studentPortal = asyncHandler(async (req, res) => {
  const data = await resultService.getStudentResultPortal(req.user.id);
  res.json({ success: true, ...data });
});

export const analytics = asyncHandler(async (req, res) => {
  const data = await resultService.getFacultyAnalytics({
    departmentId: Number(req.query.departmentId),
    semester: Number(req.query.semester),
  });
  res.json({ success: true, analytics: data });
});
