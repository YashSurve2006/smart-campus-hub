import { asyncHandler } from '../utils/asyncHandler.js';
import { query } from '../config/db.js';

export const listClassrooms = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT c.*, d.name AS department_name
     FROM classrooms c
     LEFT JOIN departments d ON d.id = c.department_id
     ORDER BY c.building, c.name`
  );
  res.json({ success: true, classrooms: rows });
});
