const pool = require('../config/db');

const getDb = (conn) => conn || pool;

const listByStoreId = async (storeId) => {
  const [rows] = await pool.query(
    'SELECT * FROM store_hours WHERE store_id = ? AND deleted_at IS NULL ORDER BY day_of_week ASC',
    [storeId]
  );
  return rows;
};

const upsertMany = async (storeId, hours, conn) => {
  if (!hours || !hours.length) return 0;
  const db = getDb(conn);
  let affected = 0;

  for (const item of hours) {
    const [res] = await db.query(
      `INSERT INTO store_hours (store_id, day_of_week, open_time, close_time, is_closed, created_at, updated_at, deleted_at)
       VALUES (?,?,?,?,?,NOW(),NOW(),NULL)
       ON DUPLICATE KEY UPDATE
         open_time = VALUES(open_time),
         close_time = VALUES(close_time),
         is_closed = VALUES(is_closed),
         updated_at = NOW(),
         deleted_at = NULL`,
      [
        storeId,
        item.day_of_week,
        item.open_time || null,
        item.close_time || null,
        item.is_closed ? 1 : 0
      ]
    );
    affected += res.affectedRows || 0;
  }

  return affected;
};

module.exports = {
  listByStoreId,
  upsertMany
};
