const pool = require('../config/db');

const listPaginated = async ({ limit, offset, search }) => {
  const where = ['deleted_at IS NULL'];
  const params = [];

  if (search) {
    const term = `%${search}%`;
    where.push('(name LIKE ? OR city LIKE ?)');
    params.push(term, term);
  }

  const sql = `SELECT * FROM stores WHERE ${where.join(' AND ')} ORDER BY id DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  const [rows] = await pool.query(sql, params);
  return rows;
};

const countAll = async ({ search }) => {
  const where = ['deleted_at IS NULL'];
  const params = [];

  if (search) {
    const term = `%${search}%`;
    where.push('(name LIKE ? OR city LIKE ?)');
    params.push(term, term);
  }

  const [rows] = await pool.query(
    `SELECT COUNT(*) as total FROM stores WHERE ${where.join(' AND ')}`,
    params
  );
  return rows[0].total;
};

const listAll = async () => {
  const [rows] = await pool.query(
    'SELECT id, name, city FROM stores WHERE deleted_at IS NULL ORDER BY name ASC'
  );
  return rows;
};

const listCities = async () => {
  const [rows] = await pool.query(
    `SELECT DISTINCT city
     FROM stores
     WHERE deleted_at IS NULL AND city IS NOT NULL AND city <> ''
     ORDER BY city ASC`
  );
  return rows.map((row) => row.city);
};

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM stores WHERE id = ? AND deleted_at IS NULL LIMIT 1',
    [id]
  );
  return rows[0];
};

const findByIds = async (ids) => {
  if (!ids || !ids.length) return [];
  const [rows] = await pool.query(
    'SELECT id FROM stores WHERE id IN (?) AND deleted_at IS NULL',
    [ids]
  );
  return rows;
};

const create = async (data) => {
  const [res] = await pool.query(
    `INSERT INTO stores (name, logo_url, whatsapp, address, city, owner_user_id, created_at, updated_at)
     VALUES (?,?,?,?,?,?,NOW(),NOW())`,
    [
      data.name,
      data.logo_url || null,
      data.whatsapp || null,
      data.address || null,
      data.city || null,
      data.owner_user_id
    ]
  );
  return res.insertId;
};

const update = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.logo_url !== undefined) {
    fields.push('logo_url = ?');
    values.push(data.logo_url);
  }
  if (data.whatsapp !== undefined) {
    fields.push('whatsapp = ?');
    values.push(data.whatsapp);
  }
  if (data.address !== undefined) {
    fields.push('address = ?');
    values.push(data.address);
  }
  if (data.city !== undefined) {
    fields.push('city = ?');
    values.push(data.city);
  }

  if (!fields.length) return 0;

  values.push(id);
  const [res] = await pool.query(
    `UPDATE stores SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
    values
  );
  return res.affectedRows;
};

const softDelete = async (id) => {
  const [res] = await pool.query(
    'UPDATE stores SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [id]
  );
  return res.affectedRows;
};

module.exports = {
  listPaginated,
  countAll,
  listAll,
  listCities,
  findById,
  findByIds,
  create,
  update,
  softDelete
};
