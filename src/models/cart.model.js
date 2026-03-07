const pool = require('../config/db');

const getActiveCartByUserId = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM carts WHERE user_id = ? AND status = "ACTIVE" ORDER BY id DESC LIMIT 1',
    [userId]
  );
  return rows[0];
};

const createCart = async (userId) => {
  const [res] = await pool.query(
    'INSERT INTO carts (user_id, status, created_at, updated_at) VALUES (?, "ACTIVE", NOW(), NOW())',
    [userId]
  );
  return { id: res.insertId, user_id: userId, status: 'ACTIVE' };
};

const getItemsByCartId = async (cartId) => {
  const [rows] = await pool.query(
    `SELECT ci.*, p.name, p.slug, p.currency, p.base_price, p.is_active, pi.url AS primary_image
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1 AND pi.deleted_at IS NULL
     WHERE ci.cart_id = ?
     ORDER BY ci.created_at DESC`,
    [cartId]
  );
  return rows;
};

const listAdmin = async ({ limit, offset, search, status }) => {
  const where = ['1=1'];
  const params = [];

  if (status) {
    where.push('c.status = ?');
    params.push(status);
  }

  if (search) {
    const term = `%${search}%`;
    where.push('(CAST(c.id AS CHAR) LIKE ? OR u.email LIKE ? OR c.session_id LIKE ?)');
    params.push(term, term, term);
  }

  params.push(limit, offset);

  const [rows] = await pool.query(
    `SELECT
       c.*,
       u.full_name AS user_full_name,
       u.email AS user_email,
       COUNT(ci.id) AS item_lines,
       COALESCE(SUM(ci.quantity), 0) AS item_count,
       COALESCE(SUM(ci.quantity * ci.unit_price), 0) AS subtotal
     FROM carts c
     LEFT JOIN users u ON u.id = c.user_id
     LEFT JOIN cart_items ci ON ci.cart_id = c.id
     WHERE ${where.join(' AND ')}
     GROUP BY c.id
     ORDER BY c.updated_at DESC, c.id DESC
     LIMIT ? OFFSET ?`,
    params
  );

  return rows;
};

const countAdmin = async ({ search, status }) => {
  const where = ['1=1'];
  const params = [];

  if (status) {
    where.push('c.status = ?');
    params.push(status);
  }

  if (search) {
    const term = `%${search}%`;
    where.push('(CAST(c.id AS CHAR) LIKE ? OR u.email LIKE ? OR c.session_id LIKE ?)');
    params.push(term, term, term);
  }

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM carts c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE ${where.join(' AND ')}`,
    params
  );

  return rows[0].total;
};

const findByIdAdmin = async (cartId) => {
  const [rows] = await pool.query(
    `SELECT
       c.*,
       u.full_name AS user_full_name,
       u.email AS user_email,
       COUNT(ci.id) AS item_lines,
       COALESCE(SUM(ci.quantity), 0) AS item_count,
       COALESCE(SUM(ci.quantity * ci.unit_price), 0) AS subtotal
     FROM carts c
     LEFT JOIN users u ON u.id = c.user_id
     LEFT JOIN cart_items ci ON ci.cart_id = c.id
     WHERE c.id = ?
     GROUP BY c.id
     LIMIT 1`,
    [cartId]
  );

  return rows[0] || null;
};

const getItemsByCartIdAdmin = async (cartId) => {
  const [rows] = await pool.query(
    `SELECT
       ci.*, p.name, p.slug, p.currency, p.base_price, p.is_active,
       pv.sku AS variant_sku,
       pi.url AS primary_image
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     LEFT JOIN product_variants pv ON pv.id = ci.variant_id
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1 AND pi.deleted_at IS NULL
     WHERE ci.cart_id = ?
     ORDER BY ci.created_at DESC`,
    [cartId]
  );
  return rows;
};

const findItem = async (cartId, productId, variantId, optionsSignature = null) => {
  const [rows] = await pool.query(
    `SELECT * FROM cart_items
     WHERE cart_id = ? AND product_id = ? AND (variant_id <=> ?) AND (options_signature <=> ?)
     LIMIT 1`,
    [cartId, productId, variantId || null, optionsSignature]
  );
  return rows[0];
};

const addItem = async (cartId, productId, variantId, quantity, unitPrice, optionsSignature = null) => {
  const [res] = await pool.query(
    'INSERT INTO cart_items (cart_id, product_id, variant_id, options_signature, quantity, unit_price, created_at, updated_at) VALUES (?,?,?,?,?,?,NOW(),NOW())',
    [cartId, productId, variantId || null, optionsSignature, quantity, unitPrice]
  );
  return res.insertId;
};

const updateItemQuantity = async (itemId, cartId, quantity) => {
  const [res] = await pool.query(
    'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ? AND cart_id = ?',
    [quantity, itemId, cartId]
  );
  return res.affectedRows;
};

const deleteItem = async (itemId, cartId) => {
  const [res] = await pool.query('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [itemId, cartId]);
  return res.affectedRows;
};

const findItemById = async (itemId, cartId) => {
  const [rows] = await pool.query(
    'SELECT * FROM cart_items WHERE id = ? AND cart_id = ? LIMIT 1',
    [itemId, cartId]
  );
  return rows[0] || null;
};

module.exports = {
  getActiveCartByUserId,
  createCart,
  getItemsByCartId,
  listAdmin,
  countAdmin,
  findByIdAdmin,
  getItemsByCartIdAdmin,
  findItem,
  addItem,
  updateItemQuantity,
  deleteItem,
  findItemById
};
