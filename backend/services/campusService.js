import { query, queryOne } from '../config/db.js';
import { pool } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export async function listPlaces({ search, category }) {
  let sql = `SELECT * FROM campus_places WHERE 1=1`;
  const params = [];
  if (search) {
    sql += ` AND (name LIKE ? OR description LIKE ? OR building LIKE ?)`;
    const q = `%${search}%`;
    params.push(q, q, q);
  }
  if (category) {
    sql += ` AND category = ?`;
    params.push(category);
  }
  sql += ` ORDER BY name`;
  return query(sql, params);
}

export async function createPlace(data) {
  const { name, category, building, floor, description, mapX, mapY } = data;
  if (!name) throw new AppError('Name is required');
  const [result] = await pool.execute(
    `INSERT INTO campus_places (name, category, building, floor, description, map_x, map_y)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      category || 'building',
      building || null,
      floor || null,
      description || null,
      mapX ?? null,
      mapY ?? null,
    ]
  );
  return result.insertId;
}

export async function updatePlace(id, data) {
  const existing = await queryOne('SELECT * FROM campus_places WHERE id = ?', [id]);
  if (!existing) throw new AppError('Place not found', 404);
  await pool.execute(
    `UPDATE campus_places SET
      name = COALESCE(?, name),
      category = COALESCE(?, category),
      building = COALESCE(?, building),
      floor = COALESCE(?, floor),
      description = COALESCE(?, description),
      map_x = COALESCE(?, map_x),
      map_y = COALESCE(?, map_y)
     WHERE id = ?`,
    [
      data.name ?? existing.name,
      data.category ?? existing.category,
      data.building ?? existing.building,
      data.floor ?? existing.floor,
      data.description ?? existing.description,
      data.mapX !== undefined ? data.mapX : existing.map_x,
      data.mapY !== undefined ? data.mapY : existing.map_y,
      id,
    ]
  );
}

export async function deletePlace(id) {
  await pool.execute('DELETE FROM campus_places WHERE id = ?', [id]);
}
