const pool = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0];
};

const findByEmailExcludingId = async (email, id) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? AND id != ? LIMIT 1',
    [email, id]
  );
  return rows[0];
};

const findByPhone = async (phone) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE phone = ? LIMIT 1', [phone]);
  return rows[0];
};

const findByPhoneExcludingId = async (phone, id) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE phone = ? AND id != ? LIMIT 1',
    [phone, id]
  );
  return rows[0];
};

const findByEmailOrPhone = async (identifier) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? OR phone = ? LIMIT 1',
    [identifier, identifier]
  );
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0];
};

const create = async ({ full_name, email, phone, password_hash }) => {
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, phone, password_hash, created_at, updated_at) VALUES (?,?,?,?,NOW(),NOW())',
    [full_name, email, phone || null, password_hash]
  );
  return result.insertId;
};

const createAdmin = async ({ full_name, email, phone, password_hash, is_active }, conn = null) => {
  const db = conn || pool;
  const [result] = await db.query(
    `INSERT INTO users (full_name, email, phone, password_hash, is_active, created_at, updated_at)
     VALUES (?,?,?,?,?,NOW(),NOW())`,
    [full_name, email, phone || null, password_hash, is_active !== undefined ? is_active : true]
  );
  return result.insertId;
};

const listPaginated = async ({ limit, offset, search }) => {
  const where = ['u.deleted_at IS NULL'];
  const params = [];

  if (search) {
    const term = `%${search}%`;
    where.push('(u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR CAST(u.id AS CHAR) LIKE ?)');
    params.push(term, term, term, term);
  }

  params.push(limit, offset);

  const [rows] = await pool.query(
    `SELECT
       u.id,
       u.full_name,
       u.email,
       u.phone,
       u.is_active,
       u.created_at,
       GROUP_CONCAT(DISTINCT r.name ORDER BY r.name SEPARATOR ', ') AS roles_text
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles r ON r.id = ur.role_id
     WHERE ${where.join(' AND ')}
     GROUP BY u.id
     ORDER BY u.id DESC
     LIMIT ? OFFSET ?`,
    params
  );

  return rows.map((row) => ({
    ...row,
    roles_text: row.roles_text || ''
  }));
};

const countAll = async ({ search }) => {
  const where = ['deleted_at IS NULL'];
  const params = [];

  if (search) {
    const term = `%${search}%`;
    where.push('(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR CAST(id AS CHAR) LIKE ?)');
    params.push(term, term, term, term);
  }

  const [rows] = await pool.query(
    `SELECT COUNT(*) as total FROM users WHERE ${where.join(' AND ')}`,
    params
  );
  return rows[0].total;
};

const updateAdmin = async (id, data, conn = null) => {
  const db = conn || pool;
  const fields = [];
  const values = [];

  if (data.full_name !== undefined) {
    fields.push('full_name = ?');
    values.push(data.full_name);
  }
  if (data.email !== undefined) {
    fields.push('email = ?');
    values.push(data.email);
  }
  if (data.phone !== undefined) {
    fields.push('phone = ?');
    values.push(data.phone);
  }
  if (data.password_hash !== undefined) {
    fields.push('password_hash = ?');
    values.push(data.password_hash);
  }
  if (data.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(data.is_active);
  }

  if (!fields.length) return 0;

  values.push(id);
  const [res] = await db.query(
    `UPDATE users
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = ? AND deleted_at IS NULL`,
    values
  );
  return res.affectedRows;
};

const updateSelf = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.full_name !== undefined) {
    fields.push('full_name = ?');
    values.push(data.full_name);
  }
  if (data.email !== undefined) {
    fields.push('email = ?');
    values.push(data.email);
  }
  if (data.phone !== undefined) {
    fields.push('phone = ?');
    values.push(data.phone);
  }
  if (data.password_hash !== undefined) {
    fields.push('password_hash = ?');
    values.push(data.password_hash);
  }

  if (!fields.length) return 0;

  values.push(id);
  const [res] = await pool.query(
    `UPDATE users
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = ? AND deleted_at IS NULL`,
    values
  );
  return res.affectedRows;
};

const softDelete = async (id) => {
  const [res] = await pool.query(
    'UPDATE users SET deleted_at = NOW(), updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [id]
  );
  return res.affectedRows;
};

const listRoleIds = async (userId) => {
  const [rows] = await pool.query(
    'SELECT role_id FROM user_roles WHERE user_id = ? ORDER BY role_id ASC',
    [userId]
  );
  return rows.map((row) => Number(row.role_id));
};

const replaceRoles = async (userId, roleIds, conn = null) => {
  const db = conn || pool;
  await db.query('DELETE FROM user_roles WHERE user_id = ?', [userId]);
  if (!roleIds || !roleIds.length) return 0;

  const values = roleIds.map((roleId) => [userId, roleId]);
  const [res] = await db.query('INSERT IGNORE INTO user_roles (user_id, role_id) VALUES ?', [values]);
  return res.affectedRows;
};

const getRolesAndPermissions = async (userId) => {
  const [roles] = await pool.query(
    'SELECT r.id, r.name FROM roles r JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = ?',
    [userId]
  );
  const [permissions] = await pool.query(
    `SELECT p.id, p.code
     FROM permissions p
     JOIN role_permissions rp ON rp.permission_id = p.id
     JOIN user_roles ur ON ur.role_id = rp.role_id
     WHERE ur.user_id = ?`,
    [userId]
  );
  return { roles, permissions };
};

const hasPermission = async (userId, code) => {
  const [adminRows] = await pool.query(
    `SELECT 1
     FROM roles r
     JOIN user_roles ur ON ur.role_id = r.id
     WHERE ur.user_id = ? AND r.name = 'ADMIN'
     LIMIT 1`,
    [userId]
  );
  if (adminRows.length) return true;

  const [rows] = await pool.query(
    `SELECT 1
     FROM permissions p
     JOIN role_permissions rp ON rp.permission_id = p.id
     JOIN user_roles ur ON ur.role_id = rp.role_id
     WHERE ur.user_id = ? AND p.code = ?
     LIMIT 1`,
    [userId, code]
  );
  return rows.length > 0;
};

module.exports = {
  findByEmail,
  findByEmailExcludingId,
  findByPhone,
  findByPhoneExcludingId,
  findByEmailOrPhone,
  findById,
  create,
  createAdmin,
  listPaginated,
  countAll,
  updateAdmin,
  updateSelf,
  softDelete,
  listRoleIds,
  replaceRoles,
  getRolesAndPermissions,
  hasPermission
};
