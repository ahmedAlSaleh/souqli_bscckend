const pool = require('../config/db');

const listByProductId = async (productId) => {
  const [rows] = await pool.query(
    'SELECT * FROM product_variants WHERE product_id = ? AND deleted_at IS NULL ORDER BY id DESC',
    [productId]
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM product_variants WHERE id = ? AND deleted_at IS NULL LIMIT 1',
    [id]
  );
  return rows[0];
};

const create = async (productId, data) => {
  const [res] = await pool.query(
    `INSERT INTO product_variants (product_id, sku, price, stock, is_active, created_at, updated_at)
     VALUES (?,?,?,?,?,NOW(),NOW())`,
    [
      productId,
      data.sku || null,
      data.price ?? null,
      data.stock ?? 0,
      data.is_active ?? true
    ]
  );
  return res.insertId;
};

const update = async (id, productId, data) => {
  const fields = [];
  const values = [];

  if (data.sku !== undefined) {
    fields.push('sku = ?');
    values.push(data.sku || null);
  }
  if (data.price !== undefined) {
    fields.push('price = ?');
    values.push(data.price);
  }
  if (data.stock !== undefined) {
    fields.push('stock = ?');
    values.push(data.stock);
  }
  if (data.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(data.is_active ? 1 : 0);
  }

  if (!fields.length) return 0;

  values.push(id, productId);
  const [res] = await pool.query(
    `UPDATE product_variants SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = ? AND product_id = ? AND deleted_at IS NULL`,
    values
  );
  return res.affectedRows;
};

const softDelete = async (id, productId) => {
  const [res] = await pool.query(
    'UPDATE product_variants SET deleted_at = NOW() WHERE id = ? AND product_id = ? AND deleted_at IS NULL',
    [id, productId]
  );
  return res.affectedRows;
};

module.exports = {
  listByProductId,
  findById,
  create,
  update,
  softDelete
};
