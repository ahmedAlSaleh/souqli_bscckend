const pool = require('../config/db');

const listByCategoryId = async (categoryId) => {
  const [rows] = await pool.query(
    `SELECT ca.id AS map_id,
            ca.category_id,
            ca.attribute_id,
            ca.is_required,
            ca.sort_order,
            a.code,
            a.name,
            a.data_type,
            a.unit
     FROM category_attributes ca
     JOIN attributes a ON ca.attribute_id = a.id
     WHERE ca.category_id = ? AND a.deleted_at IS NULL
     ORDER BY ca.sort_order ASC, ca.id ASC`,
    [categoryId]
  );
  return rows;
};

const findMapById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM category_attributes WHERE id = ? LIMIT 1', [id]);
  return rows[0];
};

const attach = async ({ category_id, attribute_id, is_required, sort_order }) => {
  const [res] = await pool.query(
    `INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
     VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE is_required = VALUES(is_required), sort_order = VALUES(sort_order)`,
    [category_id, attribute_id, is_required ? 1 : 0, sort_order ?? 0]
  );
  return res.insertId || 0;
};

const update = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.is_required !== undefined) {
    fields.push('is_required = ?');
    values.push(data.is_required ? 1 : 0);
  }
  if (data.sort_order !== undefined) {
    fields.push('sort_order = ?');
    values.push(data.sort_order ?? 0);
  }

  if (!fields.length) return 0;

  values.push(id);
  const [res] = await pool.query(
    `UPDATE category_attributes SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return res.affectedRows;
};

const remove = async (id) => {
  const [res] = await pool.query('DELETE FROM category_attributes WHERE id = ?', [id]);
  return res.affectedRows;
};

module.exports = { listByCategoryId, findMapById, attach, update, remove };
