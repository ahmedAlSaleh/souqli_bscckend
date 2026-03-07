const pool = require('../config/db');

const listByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT id, user_id, label, country, city, street, postal_code, notes, is_default, created_at, updated_at
     FROM user_addresses
     WHERE user_id = ? AND deleted_at IS NULL
     ORDER BY is_default DESC, id DESC`,
    [userId]
  );
  return rows;
};

const create = async (userId, data, conn = null) => {
  const db = conn || pool;

  if (data.is_default) {
    await db.query('UPDATE user_addresses SET is_default = 0, updated_at = NOW() WHERE user_id = ? AND deleted_at IS NULL', [userId]);
  }

  const [res] = await db.query(
    `INSERT INTO user_addresses
      (user_id, label, country, city, street, postal_code, notes, is_default, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,NOW(),NOW())`,
    [
      userId,
      data.label || null,
      data.country || null,
      data.city || null,
      data.street || null,
      data.postal_code || null,
      data.notes || null,
      data.is_default ? 1 : 0
    ]
  );

  return res.insertId;
};

const update = async (id, userId, data, conn = null) => {
  const db = conn || pool;
  const fields = [];
  const values = [];

  if (data.label !== undefined) {
    fields.push('label = ?');
    values.push(data.label);
  }
  if (data.country !== undefined) {
    fields.push('country = ?');
    values.push(data.country);
  }
  if (data.city !== undefined) {
    fields.push('city = ?');
    values.push(data.city);
  }
  if (data.street !== undefined) {
    fields.push('street = ?');
    values.push(data.street);
  }
  if (data.postal_code !== undefined) {
    fields.push('postal_code = ?');
    values.push(data.postal_code);
  }
  if (data.notes !== undefined) {
    fields.push('notes = ?');
    values.push(data.notes);
  }
  if (data.is_default !== undefined) {
    fields.push('is_default = ?');
    values.push(data.is_default ? 1 : 0);
  }

  if (!fields.length) return 0;

  if (data.is_default) {
    await db.query('UPDATE user_addresses SET is_default = 0, updated_at = NOW() WHERE user_id = ? AND deleted_at IS NULL', [userId]);
  }

  values.push(id, userId);
  const [res] = await db.query(
    `UPDATE user_addresses
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
    values
  );
  return res.affectedRows;
};

const softDelete = async (id, userId) => {
  const [res] = await pool.query(
    `UPDATE user_addresses
     SET deleted_at = NOW(), updated_at = NOW()
     WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
    [id, userId]
  );
  return res.affectedRows;
};

module.exports = {
  listByUserId,
  create,
  update,
  softDelete
};
