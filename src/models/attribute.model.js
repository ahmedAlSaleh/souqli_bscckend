const pool = require('../config/db');

const listPaginated = async ({ limit, offset }) => {
  const [rows] = await pool.query(
    'SELECT * FROM attributes WHERE deleted_at IS NULL ORDER BY id DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
  return rows;
};

const countAll = async () => {
  const [rows] = await pool.query('SELECT COUNT(*) as total FROM attributes WHERE deleted_at IS NULL');
  return rows[0].total;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM attributes WHERE id = ? AND deleted_at IS NULL LIMIT 1',
    [id]
  );
  return rows[0];
};

const create = async ({ code, name, data_type, unit }) => {
  const [res] = await pool.query(
    'INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at) VALUES (?,?,?,?,NOW(),NOW())',
    [code, name, data_type, unit || null]
  );
  return res.insertId;
};

const update = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.code !== undefined) {
    fields.push('code = ?');
    values.push(data.code);
  }
  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.data_type !== undefined) {
    fields.push('data_type = ?');
    values.push(data.data_type);
  }
  if (data.unit !== undefined) {
    fields.push('unit = ?');
    values.push(data.unit);
  }

  if (!fields.length) return 0;

  values.push(id);
  const [res] = await pool.query(
    `UPDATE attributes SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
    values
  );
  return res.affectedRows;
};

const softDelete = async (id) => {
  const [res] = await pool.query(
    'UPDATE attributes SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [id]
  );
  return res.affectedRows;
};

const listOptions = async (attributeId) => {
  const [rows] = await pool.query(
    'SELECT * FROM attribute_options WHERE attribute_id = ? ORDER BY sort_order ASC, id ASC',
    [attributeId]
  );
  return rows;
};

const createOption = async (attributeId, { value, sort_order }) => {
  const [res] = await pool.query(
    'INSERT INTO attribute_options (attribute_id, value, sort_order) VALUES (?,?,?)',
    [attributeId, value, sort_order ?? 0]
  );
  return res.insertId;
};

const updateOption = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.value !== undefined) {
    fields.push('value = ?');
    values.push(data.value);
  }
  if (data.sort_order !== undefined) {
    fields.push('sort_order = ?');
    values.push(data.sort_order);
  }

  if (!fields.length) return 0;

  values.push(id);
  const [res] = await pool.query(`UPDATE attribute_options SET ${fields.join(', ')} WHERE id = ?`, values);
  return res.affectedRows;
};

const deleteOption = async (id) => {
  const [res] = await pool.query('DELETE FROM attribute_options WHERE id = ?', [id]);
  return res.affectedRows;
};

const validateOptionPairs = async (pairs) => {
  if (!pairs.length) return true;
  const conditions = pairs.map(() => '(attribute_id = ? AND id = ?)').join(' OR ');
  const params = pairs.flatMap((pair) => [pair.attribute_id, pair.option_id]);
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM attribute_options WHERE ${conditions}`,
    params
  );
  return Number(rows[0].total || 0) === pairs.length;
};

module.exports = {
  listPaginated,
  countAll,
  findById,
  create,
  update,
  softDelete,
  listOptions,
  createOption,
  updateOption,
  deleteOption,
  validateOptionPairs
};
