const pool = require('../config/db');

const listByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT f.product_id,
            p.name,
            p.base_price,
            p.currency,
            p.deal_price,
            p.is_deal,
            p.deal_start_at,
            p.deal_end_at,
            COALESCE(pr.rating_avg, 0) AS rating_avg,
            COALESCE(pr.rating_count, 0) AS rating_count,
            pi.url AS primary_image
     FROM favorites f
     JOIN products p ON p.id = f.product_id
     LEFT JOIN (
       SELECT product_id, AVG(rating) AS rating_avg, COUNT(*) AS rating_count
       FROM product_reviews
       WHERE deleted_at IS NULL
       GROUP BY product_id
     ) pr ON pr.product_id = p.id
     LEFT JOIN product_images pi
       ON pi.product_id = p.id AND pi.is_primary = 1 AND pi.deleted_at IS NULL
     WHERE f.user_id = ?
       AND f.deleted_at IS NULL
       AND p.deleted_at IS NULL
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return rows;
};

const add = async (userId, productId) => {
  const [restore] = await pool.query(
    'UPDATE favorites SET deleted_at = NULL, updated_at = NOW() WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );
  if (restore.affectedRows > 0) return true;

  await pool.query(
    'INSERT IGNORE INTO favorites (user_id, product_id, created_at, updated_at) VALUES (?,?,NOW(),NOW())',
    [userId, productId]
  );
  return true;
};

const remove = async (userId, productId) => {
  const [res] = await pool.query(
    'UPDATE favorites SET deleted_at = NOW(), updated_at = NOW() WHERE user_id = ? AND product_id = ? AND deleted_at IS NULL',
    [userId, productId]
  );
  return res.affectedRows;
};

const listIdsByUser = async (userId) => {
  const [rows] = await pool.query(
    'SELECT product_id FROM favorites WHERE user_id = ? AND deleted_at IS NULL',
    [userId]
  );
  return rows.map((row) => Number(row.product_id));
};

module.exports = { listByUser, add, remove, listIdsByUser };
