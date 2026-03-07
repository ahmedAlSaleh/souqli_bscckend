const pool = require('../config/db');

const listByProduct = async ({ productId, limit, offset }) => {
  const [rows] = await pool.query(
    `SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at,
            u.full_name AS user_full_name
     FROM product_reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = ? AND r.deleted_at IS NULL
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [productId, limit, offset]
  );
  return rows;
};

const countByProduct = async (productId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS total FROM product_reviews WHERE product_id = ? AND deleted_at IS NULL',
    [productId]
  );
  return rows[0].total;
};

const getStatsByProductId = async (productId) => {
  const [rows] = await pool.query(
    `SELECT COALESCE(AVG(rating), 0) AS rating_avg, COUNT(*) AS rating_count
     FROM product_reviews
     WHERE product_id = ? AND deleted_at IS NULL`,
    [productId]
  );
  return rows[0] || { rating_avg: 0, rating_count: 0 };
};

const create = async (userId, productId, data) => {
  const [res] = await pool.query(
    `INSERT INTO product_reviews
      (product_id, user_id, rating, comment, created_at, updated_at)
     VALUES (?,?,?,?,NOW(),NOW())`,
    [productId, userId, data.rating, data.comment || null]
  );
  return res.insertId;
};

module.exports = {
  listByProduct,
  countByProduct,
  getStatsByProductId,
  create
};
