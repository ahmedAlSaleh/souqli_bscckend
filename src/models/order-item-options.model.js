const pool = require('../config/db');

const addForOrderItems = async (rows, conn = null) => {
  if (!rows.length) return 0;
  const db = conn || pool;
  const values = rows.map((row) => [
    row.order_item_id,
    row.attribute_id,
    row.option_id,
    new Date()
  ]);
  const [res] = await db.query(
    'INSERT INTO order_item_options (order_item_id, attribute_id, option_id, created_at) VALUES ?',
    [values]
  );
  return res.affectedRows;
};

const listByOrderId = async (orderId) => {
  const [rows] = await pool.query(
    `SELECT oio.order_item_id,
            oio.attribute_id,
            oio.option_id,
            a.code AS attribute_code,
            a.name AS attribute_name,
            ao.value AS option_value
     FROM order_item_options oio
     JOIN order_items oi ON oi.id = oio.order_item_id
     JOIN attributes a ON a.id = oio.attribute_id
     JOIN attribute_options ao ON ao.id = oio.option_id
     WHERE oi.order_id = ?`,
    [orderId]
  );
  return rows;
};

module.exports = { addForOrderItems, listByOrderId };
