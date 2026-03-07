const pool = require('../config/db');

const getDb = (conn) => conn || pool;

const getByProductId = async (productId) => {
  const [rows] = await pool.query(
    'SELECT product_id, quantity, reserved_quantity FROM product_stock WHERE product_id = ? LIMIT 1',
    [productId]
  );
  return rows[0] || null;
};

const upsert = async (productId, data, conn) => {
  const db = getDb(conn);
  const [res] = await db.query(
    `INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
     VALUES (?,?,?,NOW())
     ON DUPLICATE KEY UPDATE
       quantity = VALUES(quantity),
       reserved_quantity = VALUES(reserved_quantity),
       updated_at = NOW()`,
    [productId, data.quantity ?? 0, data.reserved_quantity ?? 0]
  );
  return res.affectedRows;
};

module.exports = { getByProductId, upsert };
