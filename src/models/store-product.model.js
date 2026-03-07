const pool = require('../config/db');

const getDb = (conn) => conn || pool;

const listByStoreId = async ({ storeId, limit, offset }) => {
  const [rows] = await pool.query(
    `SELECT sp.*, p.name AS product_name, p.base_price, p.currency
     FROM store_products sp
     JOIN products p ON sp.product_id = p.id
     WHERE sp.store_id = ? AND sp.deleted_at IS NULL AND p.deleted_at IS NULL
     ORDER BY sp.id DESC
     LIMIT ? OFFSET ?`,
    [storeId, limit, offset]
  );
  return rows;
};

const countByStoreId = async (storeId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as total FROM store_products WHERE store_id = ? AND deleted_at IS NULL',
    [storeId]
  );
  return rows[0].total;
};

const listByProductId = async (productId) => {
  const [rows] = await pool.query(
    `SELECT sp.*, s.name AS store_name, s.city, s.logo_url
     FROM store_products sp
     JOIN stores s ON sp.store_id = s.id
     WHERE sp.product_id = ? AND sp.deleted_at IS NULL AND s.deleted_at IS NULL
     ORDER BY s.name ASC`,
    [productId]
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM store_products WHERE id = ? AND deleted_at IS NULL LIMIT 1',
    [id]
  );
  return rows[0];
};

const upsert = async (data, conn) => {
  const db = getDb(conn);
  const [res] = await db.query(
    `INSERT INTO store_products (store_id, product_id, stock, price_override, is_available, created_at, updated_at, deleted_at)
     VALUES (?,?,?,?,?,NOW(),NOW(),NULL)
     ON DUPLICATE KEY UPDATE
       stock = VALUES(stock),
       price_override = VALUES(price_override),
       is_available = VALUES(is_available),
       updated_at = NOW(),
       deleted_at = NULL`,
    [
      data.store_id,
      data.product_id,
      data.stock ?? 0,
      data.price_override ?? null,
      data.is_available !== undefined ? (data.is_available ? 1 : 0) : 1
    ]
  );
  return res.affectedRows;
};

const updateById = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.stock !== undefined) {
    fields.push('stock = ?');
    values.push(data.stock);
  }
  if (data.price_override !== undefined) {
    fields.push('price_override = ?');
    values.push(data.price_override);
  }
  if (data.is_available !== undefined) {
    fields.push('is_available = ?');
    values.push(data.is_available ? 1 : 0);
  }

  if (!fields.length) return 0;

  values.push(id);
  const [res] = await pool.query(
    `UPDATE store_products SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = ? AND deleted_at IS NULL`,
    values
  );
  return res.affectedRows;
};

const softDelete = async (id) => {
  const [res] = await pool.query(
    'UPDATE store_products SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [id]
  );
  return res.affectedRows;
};

const syncForProduct = async (productId, stores, conn) => {
  const db = getDb(conn);
  const storeIds = stores.map((item) => item.store_id);

  if (storeIds.length) {
    await db.query(
      'UPDATE store_products SET deleted_at = NOW() WHERE product_id = ? AND deleted_at IS NULL AND store_id NOT IN (?)',
      [productId, storeIds]
    );
  }

  for (const item of stores) {
    await upsert(
      {
        store_id: item.store_id,
        product_id: productId,
        stock: item.stock,
        price_override: item.price_override,
        is_available: item.is_available
      },
      conn
    );
  }
};

module.exports = {
  listByStoreId,
  countByStoreId,
  listByProductId,
  findById,
  upsert,
  updateById,
  softDelete,
  syncForProduct
};
