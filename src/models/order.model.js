const pool = require('../config/db');

const RESERVABLE_STATUS_CODES = ['PENDING', 'ACCEPTED', 'PROCESSING'];

const findStatusId = async (code) => {
  const [rows] = await pool.query('SELECT id FROM order_statuses WHERE code = ? LIMIT 1', [code]);
  return rows[0] ? rows[0].id : null;
};

const findStatusById = async (id) => {
  const [rows] = await pool.query('SELECT id, code, name FROM order_statuses WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

const findStatusByCode = async (code) => {
  const [rows] = await pool.query('SELECT id, code, name FROM order_statuses WHERE code = ? LIMIT 1', [code]);
  return rows[0] || null;
};

const listStatuses = async () => {
  const [rows] = await pool.query('SELECT id, code, name FROM order_statuses ORDER BY id ASC');
  return rows;
};

const create = async (data, conn) => {
  const db = conn || pool;
  const [res] = await db.query(
    'INSERT INTO orders (user_id, status_id, address_id, cart_id, total_amount, currency, notes, created_at, updated_at) VALUES (?,?,?,?,?,?,?,NOW(),NOW())',
    [
      data.user_id,
      data.status_id,
      data.address_id || null,
      data.cart_id || null,
      data.total_amount,
      data.currency || 'USD',
      data.notes || null
    ]
  );
  return res.insertId;
};

const addItems = async (orderId, items, conn) => {
  if (!items.length) return [];
  const db = conn || pool;
  const created = [];
  for (const item of items) {
    const [res] = await db.query(
      'INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price, line_total) VALUES (?,?,?,?,?,?)',
      [
        orderId,
        item.product_id,
        item.variant_id || null,
        item.quantity,
        item.unit_price,
        item.line_total
      ]
    );
    created.push({ order_item_id: res.insertId, cart_item_id: item.cart_item_id });
  }
  return created;
};

const listByUser = async (userId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT o.*, os.code AS status_code, os.name AS status_name
     FROM orders o
     JOIN order_statuses os ON o.status_id = os.id
     WHERE o.user_id = ? AND o.deleted_at IS NULL
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  return rows;
};

const listAdmin = async ({ limit, offset, search, statusId }) => {
  const where = ['o.deleted_at IS NULL'];
  const params = [];

  if (statusId) {
    where.push('o.status_id = ?');
    params.push(statusId);
  }

  if (search) {
    const term = `%${search}%`;
    where.push('(CAST(o.id AS CHAR) LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)');
    params.push(term, term, term);
  }

  params.push(limit, offset);

  const [rows] = await pool.query(
    `SELECT
       o.*,
       os.code AS status_code,
       os.name AS status_name,
       u.full_name AS user_full_name,
       u.email AS user_email,
       u.phone AS user_phone
     FROM orders o
     JOIN order_statuses os ON o.status_id = os.id
     JOIN users u ON o.user_id = u.id
     WHERE ${where.join(' AND ')}
     ORDER BY o.created_at DESC, o.id DESC
     LIMIT ? OFFSET ?`,
    params
  );

  return rows;
};

const countAdmin = async ({ search, statusId }) => {
  const where = ['o.deleted_at IS NULL'];
  const params = [];

  if (statusId) {
    where.push('o.status_id = ?');
    params.push(statusId);
  }

  if (search) {
    const term = `%${search}%`;
    where.push('(CAST(o.id AS CHAR) LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)');
    params.push(term, term, term);
  }

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM orders o
     JOIN users u ON o.user_id = u.id
     WHERE ${where.join(' AND ')}`,
    params
  );

  return rows[0].total;
};

const findAdminById = async (id) => {
  const [rows] = await pool.query(
    `SELECT
       o.*,
       os.code AS status_code,
       os.name AS status_name,
       u.full_name AS user_full_name,
       u.email AS user_email,
       u.phone AS user_phone,
       ua.label AS address_label,
       ua.country AS address_country,
       ua.city AS address_city,
       ua.street AS address_street,
       ua.postal_code AS address_postal_code,
       ua.notes AS address_notes
     FROM orders o
     JOIN order_statuses os ON o.status_id = os.id
     JOIN users u ON o.user_id = u.id
     LEFT JOIN user_addresses ua ON ua.id = o.address_id
     WHERE o.id = ? AND o.deleted_at IS NULL
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const countByUser = async (userId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as total FROM orders WHERE user_id = ? AND deleted_at IS NULL',
    [userId]
  );
  return rows[0].total;
};

const getItemsByOrderId = async (orderId) => {
  const [rows] = await pool.query(
    `SELECT oi.*, p.name, p.slug, pv.sku AS variant_sku, s.name AS store_name
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     LEFT JOIN product_variants pv ON pv.id = oi.variant_id
     LEFT JOIN stores s ON s.id = oi.store_id
     WHERE oi.order_id = ?`,
    [orderId]
  );
  return rows;
};

const findItemByOrderAndId = async (orderId, itemId) => {
  const [rows] = await pool.query(
    `SELECT
       oi.*,
       o.status_id,
       os.code AS order_status_code
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN order_statuses os ON os.id = o.status_id
     WHERE oi.order_id = ? AND oi.id = ? AND o.deleted_at IS NULL
     LIMIT 1`,
    [orderId, itemId]
  );
  return rows[0] || null;
};

const getStoreProductMapping = async (storeId, productId) => {
  const [rows] = await pool.query(
    `SELECT
       sp.*,
       s.name AS store_name
     FROM store_products sp
     JOIN stores s ON s.id = sp.store_id
     WHERE sp.store_id = ?
       AND sp.product_id = ?
       AND sp.deleted_at IS NULL
       AND s.deleted_at IS NULL
     LIMIT 1`,
    [storeId, productId]
  );
  return rows[0] || null;
};

const getReservedQtyForStoreProduct = async ({ storeId, productId, excludeItemId = null }) => {
  const statusPlaceholders = RESERVABLE_STATUS_CODES.map(() => '?').join(',');
  const params = [storeId, productId, ...RESERVABLE_STATUS_CODES];
  let excludeSql = '';
  if (excludeItemId) {
    excludeSql = ' AND oi.id <> ?';
    params.push(excludeItemId);
  }

  const [rows] = await pool.query(
    `SELECT COALESCE(SUM(oi.quantity), 0) AS reserved_qty
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id AND o.deleted_at IS NULL
     JOIN order_statuses os ON os.id = o.status_id
     WHERE oi.store_id = ?
       AND oi.product_id = ?
       AND os.code IN (${statusPlaceholders})
       ${excludeSql}`,
    params
  );

  return Number(rows[0].reserved_qty || 0);
};

const listAssignableStoresForOrderItem = async ({ orderId, itemId }) => {
  const item = await findItemByOrderAndId(orderId, itemId);
  if (!item) return [];

  const statusPlaceholders = RESERVABLE_STATUS_CODES.map(() => '?').join(',');
  const [rows] = await pool.query(
    `SELECT
       s.id AS store_id,
       s.name AS store_name,
       sp.stock,
       sp.price_override,
       sp.is_available,
       COALESCE((
         SELECT SUM(oi2.quantity)
         FROM order_items oi2
         JOIN orders o2 ON o2.id = oi2.order_id AND o2.deleted_at IS NULL
         JOIN order_statuses os2 ON os2.id = o2.status_id
         WHERE oi2.store_id = sp.store_id
           AND oi2.product_id = sp.product_id
           AND os2.code IN (${statusPlaceholders})
           AND oi2.id <> ?
       ), 0) AS reserved_qty
     FROM store_products sp
     JOIN stores s ON s.id = sp.store_id
     WHERE sp.product_id = ?
       AND sp.deleted_at IS NULL
       AND s.deleted_at IS NULL
     ORDER BY s.name ASC`,
    [...RESERVABLE_STATUS_CODES, item.id, item.product_id]
  );

  return rows.map((row) => {
    const stock = Number(row.stock || 0);
    const reservedQty = Number(row.reserved_qty || 0);
    const availableQty = stock - reservedQty;
    return {
      ...row,
      stock,
      reserved_qty: reservedQty,
      available_qty: availableQty,
      can_assign: Boolean(row.is_available) && availableQty >= Number(item.quantity || 0),
      is_selected: Number(item.store_id || 0) === Number(row.store_id)
    };
  });
};

const assignStoreToItem = async ({ orderId, itemId, storeId }, conn = null) => {
  const db = conn || pool;
  const [res] = await db.query(
    'UPDATE order_items SET store_id = ? WHERE order_id = ? AND id = ?',
    [storeId || null, orderId, itemId]
  );
  return res.affectedRows;
};

const updateStatus = async (id, statusId) => {
  const [res] = await pool.query(
    `UPDATE orders
     SET status_id = ?, updated_at = NOW()
     WHERE id = ? AND deleted_at IS NULL`,
    [statusId, id]
  );
  return res.affectedRows;
};

const updateCartStatus = async (cartId, status, conn) => {
  const db = conn || pool;
  const [res] = await db.query(
    'UPDATE carts SET status = ?, updated_at = NOW() WHERE id = ?',
    [status, cartId]
  );
  return res.affectedRows;
};

module.exports = {
  RESERVABLE_STATUS_CODES,
  findStatusId,
  findStatusById,
  findStatusByCode,
  listStatuses,
  create,
  addItems,
  listByUser,
  listAdmin,
  countAdmin,
  findAdminById,
  countByUser,
  getItemsByOrderId,
  findItemByOrderAndId,
  getStoreProductMapping,
  getReservedQtyForStoreProduct,
  listAssignableStoresForOrderItem,
  assignStoreToItem,
  updateStatus,
  updateCartStatus
};
