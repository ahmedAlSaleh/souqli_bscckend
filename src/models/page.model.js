const pool = require('../config/db');

const listPaginated = async ({ limit, offset }) => {
  const [rows] = await pool.query('SELECT * FROM pages ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset]);
  return rows;
};

const countAll = async () => {
  const [rows] = await pool.query('SELECT COUNT(*) as total FROM pages');
  return rows[0].total;
};

const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM pages WHERE id = ? LIMIT 1', [id]);
  return rows[0];
};

const create = async ({ key, title, content }) => {
  const [res] = await pool.query(
    'INSERT INTO pages (`key`, title, content, updated_at) VALUES (?,?,?,NOW())',
    [key, title, content]
  );
  return res.insertId;
};

const update = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.key !== undefined) {
    fields.push('`key` = ?');
    values.push(data.key);
  }
  if (data.title !== undefined) {
    fields.push('title = ?');
    values.push(data.title);
  }
  if (data.content !== undefined) {
    fields.push('content = ?');
    values.push(data.content);
  }

  if (!fields.length) return 0;

  values.push(id);
  const [res] = await pool.query(
    `UPDATE pages SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
    values
  );
  return res.affectedRows;
};

const remove = async (id) => {
  const [res] = await pool.query('DELETE FROM pages WHERE id = ?', [id]);
  return res.affectedRows;
};

module.exports = { listPaginated, countAll, findById, create, update, remove };
