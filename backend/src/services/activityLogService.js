const { pool } = require("../config/db");

async function logActivity({
  actorType,
  actorId = null,
  action,
  targetType = null,
  targetId = null,
  metadata = null,
}) {
  await pool.execute(
    `INSERT INTO activity_logs (actor_type, actor_id, action, target_type, target_id, metadata)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      actorType,
      actorId,
      action,
      targetType,
      targetId,
      metadata ? JSON.stringify(metadata) : null,
    ],
  );
}

module.exports = {
  logActivity,
};
