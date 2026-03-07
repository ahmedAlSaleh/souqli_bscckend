const pool = require('../config/db');

const listByStoreId = async (storeId) => {
  const [rows] = await pool.query(
    'SELECT * FROM store_phones WHERE store_id = ? AND deleted_at IS NULL ORDER BY id DESC',
    [storeId]
  );
  return rows;
};

const create = async (storeId, data) => {
  const [res] = await pool.query(
    `INSERT INTO store_phones (store_id, phone, label, is_primary, created_at, updated_at)
     VALUES (?,?,?,?,NOW(),NOW())`,
    [storeId, data.phone, data.label || null, data.is_primary ? 1 : 0]
  );
  return res.insertId;
};

const update = async (id, storeId, data) => {
  const fields = [];
  const values = [];

  if (data.phone !== undefined) {
    fields.push('phone = ?');
    values.push(data.phone);
  }
  if (data.label !== undefined) {
    fields.push('label = ?');
    values.push(data.label);
  }
  if (data.is_primary !== undefined) {
    fields.push('is_primary = ?');
    values.push(data.is_primary ? 1 : 0);
  }

  if (!fields.length) return 0;

  values.push(id, storeId);
  const [res] = await pool.query(
    `UPDATE store_phones SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = ? AND store_id = ? AND deleted_at IS NULL`,
    values
  );
  return res.affectedRows;
};

const softDelete = async (id, storeId) => {
  const [res] = await pool.query(
    'UPDATE store_phones SET deleted_at = NOW() WHERE id = ? AND store_id = ? AND deleted_at IS NULL',
    [id, storeId]
  );
  return res.affectedRows;
};

module.exports = {
  listByStoreId,
  create,
  update,
  softDelete
};
