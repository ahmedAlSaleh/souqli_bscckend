const pool = require('../config/db');

const listByCartId = async (cartId) => {
  const [rows] = await pool.query(
    `SELECT cio.cart_item_id,
            cio.attribute_id,
            cio.option_id,
            a.code AS attribute_code,
            a.name AS attribute_name,
            ao.value AS option_value
     FROM cart_item_options cio
     JOIN attributes a ON a.id = cio.attribute_id
     JOIN attribute_options ao ON ao.id = cio.option_id
     WHERE cio.cart_item_id IN (SELECT id FROM cart_items WHERE cart_id = ?)`,
    [cartId]
  );
  return rows;
};

const replaceForItem = async (cartItemId, options, conn = null) => {
  const db = conn || pool;
  await db.query('DELETE FROM cart_item_options WHERE cart_item_id = ?', [cartItemId]);
  if (!options.length) return 0;
  const values = options.map((opt) => [
    cartItemId,
    opt.attribute_id,
    opt.option_id,
    new Date()
  ]);
  const [res] = await db.query(
    'INSERT INTO cart_item_options (cart_item_id, attribute_id, option_id, created_at) VALUES ?',
    [values]
  );
  return res.affectedRows;
};

const listByItemIds = async (itemIds) => {
  if (!itemIds.length) return [];
  const [rows] = await pool.query(
    `SELECT cio.cart_item_id,
            cio.attribute_id,
            cio.option_id,
            a.code AS attribute_code,
            a.name AS attribute_name,
            ao.value AS option_value
     FROM cart_item_options cio
     JOIN attributes a ON a.id = cio.attribute_id
     JOIN attribute_options ao ON ao.id = cio.option_id
     WHERE cio.cart_item_id IN (?)`,
    [itemIds]
  );
  return rows;
};

module.exports = { listByCartId, replaceForItem, listByItemIds };
