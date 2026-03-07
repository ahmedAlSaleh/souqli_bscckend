const pool = require('../config/db');

const listAdmin = async ({ limit, offset }) => {
  const [rows] = await pool.query(
    'SELECT * FROM home_banners WHERE deleted_at IS NULL ORDER BY sort_order ASC, id DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
  return rows;
};

const countAdmin = async () => {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM home_banners WHERE deleted_at IS NULL');
  return rows[0].total;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM home_banners WHERE id = ? AND deleted_at IS NULL LIMIT 1',
    [id]
  );
  return rows[0];
};

const listActive = async () => {
  const [rows] = await pool.query(
    `SELECT id, title, subtitle, image_url, button_text, button_link, sort_order
     FROM home_banners
     WHERE deleted_at IS NULL AND is_active = 1
     ORDER BY sort_order ASC, id DESC`
  );
  return rows;
};

const create = async (data) => {
  const [res] = await pool.query(
    `INSERT INTO home_banners (title, subtitle, image_url, button_text, button_link, sort_order, is_active, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,NOW(),NOW())`,
    [
      data.title,
      data.subtitle || null,
      data.image_url,
      data.button_text || null,
      data.button_link || null,
      data.sort_order ?? 0,
      data.is_active ?? true
    ]
  );
  return res.insertId;
};

const update = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.title !== undefined) {
    fields.push('title = ?');
    values.push(data.title);
  }
  if (data.subtitle !== undefined) {
    fields.push('subtitle = ?');
    values.push(data.subtitle);
  }
  if (data.image_url !== undefined) {
    fields.push('image_url = ?');
    values.push(data.image_url);
  }
  if (data.button_text !== undefined) {
    fields.push('button_text = ?');
    values.push(data.button_text);
  }
  if (data.button_link !== undefined) {
    fields.push('button_link = ?');
    values.push(data.button_link);
  }
  if (data.sort_order !== undefined) {
    fields.push('sort_order = ?');
    values.push(data.sort_order);
  }
  if (data.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(data.is_active);
  }

  if (!fields.length) return 0;

  values.push(id);
  const [res] = await pool.query(
    `UPDATE home_banners SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
    values
  );
  return res.affectedRows;
};

const softDelete = async (id) => {
  const [res] = await pool.query(
    'UPDATE home_banners SET deleted_at = NOW(), is_active = 0 WHERE id = ? AND deleted_at IS NULL',
    [id]
  );
  return res.affectedRows;
};

module.exports = {
  listAdmin,
  countAdmin,
  findById,
  listActive,
  create,
  update,
  softDelete
};
