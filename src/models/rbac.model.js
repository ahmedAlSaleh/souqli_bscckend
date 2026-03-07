const pool = require('../config/db');

const listRoles = async () => {
  const [rows] = await pool.query(
    `SELECT
       r.id,
       r.name,
       r.description,
       r.created_at,
       r.updated_at,
       COUNT(DISTINCT ur.user_id) AS users_count,
       COUNT(DISTINCT rp.permission_id) AS permissions_count
     FROM roles r
     LEFT JOIN user_roles ur ON ur.role_id = r.id
     LEFT JOIN role_permissions rp ON rp.role_id = r.id
     GROUP BY r.id
     ORDER BY r.name ASC`
  );
  return rows;
};

const findRoleById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM roles WHERE id = ? LIMIT 1', [id]);
  return rows[0];
};

const createRole = async ({ name, description }) => {
  const [res] = await pool.query(
    'INSERT INTO roles (name, description, created_at, updated_at) VALUES (?,?,NOW(),NOW())',
    [name, description || null]
  );
  return res.insertId;
};

const updateRole = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    values.push(data.description);
  }

  if (!fields.length) return 0;

  values.push(id);
  const [res] = await pool.query(
    `UPDATE roles SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
    values
  );
  return res.affectedRows;
};

const deleteRole = async (id) => {
  const [res] = await pool.query('DELETE FROM roles WHERE id = ?', [id]);
  return res.affectedRows;
};

const listPermissions = async () => {
  const [rows] = await pool.query(
    `SELECT
       p.id,
       p.code,
       p.description,
       p.created_at,
       p.updated_at,
       COUNT(DISTINCT rp.role_id) AS roles_count
     FROM permissions p
     LEFT JOIN role_permissions rp ON rp.permission_id = p.id
     GROUP BY p.id
     ORDER BY p.code ASC`
  );
  return rows;
};

const findPermissionById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM permissions WHERE id = ? LIMIT 1', [id]);
  return rows[0];
};

const createPermission = async ({ code, description }) => {
  const [res] = await pool.query(
    'INSERT INTO permissions (code, description, created_at, updated_at) VALUES (?,?,NOW(),NOW())',
    [code, description || null]
  );
  return res.insertId;
};

const updatePermission = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.code !== undefined) {
    fields.push('code = ?');
    values.push(data.code);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    values.push(data.description);
  }

  if (!fields.length) return 0;

  values.push(id);
  const [res] = await pool.query(
    `UPDATE permissions SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
    values
  );
  return res.affectedRows;
};

const deletePermission = async (id) => {
  const [res] = await pool.query('DELETE FROM permissions WHERE id = ?', [id]);
  return res.affectedRows;
};

const listRolePermissionIds = async (roleId) => {
  const [rows] = await pool.query(
    'SELECT permission_id FROM role_permissions WHERE role_id = ? ORDER BY permission_id ASC',
    [roleId]
  );
  return rows.map((row) => Number(row.permission_id));
};

const replaceRolePermissions = async (roleId, permissionIds, conn = null) => {
  const db = conn || pool;
  await db.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);
  if (!permissionIds || !permissionIds.length) return 0;

  const values = permissionIds.map((permissionId) => [roleId, permissionId]);
  const [res] = await db.query('INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES ?', [values]);
  return res.affectedRows;
};

const countUsersByRole = async (roleId) => {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM user_roles WHERE role_id = ?', [roleId]);
  return rows[0].total;
};

const countRolesByPermission = async (permissionId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS total FROM role_permissions WHERE permission_id = ?',
    [permissionId]
  );
  return rows[0].total;
};

const listValidRoleIds = async (roleIds) => {
  if (!roleIds || !roleIds.length) return [];
  const [rows] = await pool.query('SELECT id FROM roles WHERE id IN (?)', [roleIds]);
  return rows.map((row) => Number(row.id));
};

const listValidPermissionIds = async (permissionIds) => {
  if (!permissionIds || !permissionIds.length) return [];
  const [rows] = await pool.query('SELECT id FROM permissions WHERE id IN (?)', [permissionIds]);
  return rows.map((row) => Number(row.id));
};

module.exports = {
  listRoles,
  findRoleById,
  createRole,
  updateRole,
  deleteRole,
  listPermissions,
  findPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  listRolePermissionIds,
  replaceRolePermissions,
  countUsersByRole,
  countRolesByPermission,
  listValidRoleIds,
  listValidPermissionIds
};
