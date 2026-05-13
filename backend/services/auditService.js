import { pool } from '../config/db.js';

export async function logAudit({
  userId,
  action,
  entityType,
  entityId,
  metadata,
  ipAddress,
  userAgent,
}) {
  try {
    await pool.execute(
      `INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, metadata, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId ?? null,
        action,
        entityType ?? null,
        entityId != null ? String(entityId) : null,
        metadata != null ? JSON.stringify(metadata) : null,
        ipAddress ?? null,
        userAgent ?? null,
      ]
    );
  } catch {
    /* optional table */
  }
}

export async function logActivity(userId, action, details) {
  try {
    await pool.execute(
      `INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)`,
      [userId, action, details ?? null]
    );
  } catch {
    /* optional table */
  }
}
