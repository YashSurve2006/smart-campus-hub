import { asyncHandler } from '../utils/asyncHandler.js';
import { query } from '../config/db.js';

export const listDepartments = asyncHandler(async (req, res) => {
  const rows = await query(`SELECT id, name, code FROM departments ORDER BY name`);
  res.json({ success: true, departments: rows });
});
