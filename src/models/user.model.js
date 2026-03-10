const { randomUUID } = require('crypto');
const pool = require('../config/db');

// Real schema source table is `user` (not `users`).
// We expose alias fields (`full_name`, `phone`, `password_hash`, `is_active`, `deleted_at`)
// so existing services can keep working while using the real DB structure.
const USER_SELECT = `
  SELECT
    u.id,
    u.email,
    u.userName,
    u.phoneNumber,
    u.password,
    u.createdAt,
    u.isVerified,
    u.role,
    u.locationId,
    u.userName AS full_name,
    u.phoneNumber AS phone,
    u.password AS password_hash,
    1 AS is_active,
    NULL AS deleted_at,
    u.createdAt AS created_at,
    u.createdAt AS updated_at
  FROM \`user\` u
`;

const normalize = (row) => row || null;

const toCreatePayload = (data = {}) => {
  const fullName = data.full_name ?? data.userName ?? null;
  const phone = data.phone ?? data.phoneNumber ?? null;
  const passwordHash = data.password_hash ?? data.password ?? null;
  return {
    id: data.id || randomUUID(),
    email: data.email || null,
    userName: fullName,
    phoneNumber: phone,
    password: passwordHash,
    isVerified: data.isVerified !== undefined ? Number(Boolean(data.isVerified)) : 0,
    role: data.role || 'user',
    locationId: data.locationId || null
  };
};

const findByEmail = async (email) => {
  const [rows] = await pool.query(`${USER_SELECT} WHERE u.email = ? LIMIT 1`, [email]);
  return normalize(rows[0]);
};

const findByEmailExcludingId = async (email, id) => {
  const [rows] = await pool.query(
    `${USER_SELECT} WHERE u.email = ? AND u.id <> ? LIMIT 1`,
    [email, String(id)]
  );
  return normalize(rows[0]);
};

const findByPhone = async (phone) => {
  const [rows] = await pool.query(`${USER_SELECT} WHERE u.phoneNumber = ? LIMIT 1`, [phone]);
  return normalize(rows[0]);
};

const findByPhoneExcludingId = async (phone, id) => {
  const [rows] = await pool.query(
    `${USER_SELECT} WHERE u.phoneNumber = ? AND u.id <> ? LIMIT 1`,
    [phone, String(id)]
  );
  return normalize(rows[0]);
};

const findByEmailOrPhone = async (identifier) => {
  const [rows] = await pool.query(
    `${USER_SELECT} WHERE u.email = ? OR u.phoneNumber = ? LIMIT 1`,
    [identifier, identifier]
  );
  return normalize(rows[0]);
};

const findById = async (id) => {
  const [rows] = await pool.query(`${USER_SELECT} WHERE u.id = ? LIMIT 1`, [String(id)]);
  return normalize(rows[0]);
};

const create = async (data) => {
  const payload = toCreatePayload(data);
  await pool.query(
    `INSERT INTO \`user\`
      (id, email, userName, phoneNumber, password, createdAt, isVerified, role, locationId)
     VALUES (?, ?, ?, ?, ?, NOW(6), ?, ?, ?)`,
    [
      payload.id,
      payload.email,
      payload.userName,
      payload.phoneNumber,
      payload.password,
      payload.isVerified,
      payload.role,
      payload.locationId
    ]
  );
  return payload.id;
};

const createAdmin = async (data, conn = null) => {
  const db = conn || pool;
  const payload = toCreatePayload({ ...data, role: data.role || 'admin' });
  await db.query(
    `INSERT INTO \`user\`
      (id, email, userName, phoneNumber, password, createdAt, isVerified, role, locationId)
     VALUES (?, ?, ?, ?, ?, NOW(6), ?, ?, ?)`,
    [
      payload.id,
      payload.email,
      payload.userName,
      payload.phoneNumber,
      payload.password,
      payload.isVerified,
      payload.role,
      payload.locationId
    ]
  );
  return payload.id;
};

const listPaginated = async ({ limit, offset, search }) => {
  const where = ['1=1'];
  const params = [];
  if (search) {
    const term = `%${search}%`;
    where.push('(u.userName LIKE ? OR u.email LIKE ? OR u.phoneNumber LIKE ? OR u.id LIKE ?)');
    params.push(term, term, term, term);
  }
  params.push(limit, offset);

  const [rows] = await pool.query(
    `SELECT
       u.id,
       u.userName AS full_name,
       u.email,
       u.phoneNumber AS phone,
       1 AS is_active,
       u.createdAt AS created_at,
       u.role AS roles_text
     FROM \`user\` u
     WHERE ${where.join(' AND ')}
     ORDER BY u.createdAt DESC
     LIMIT ? OFFSET ?`,
    params
  );
  return rows;
};

const countAll = async ({ search }) => {
  const where = ['1=1'];
  const params = [];
  if (search) {
    const term = `%${search}%`;
    where.push('(userName LIKE ? OR email LIKE ? OR phoneNumber LIKE ? OR id LIKE ?)');
    params.push(term, term, term, term);
  }

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM \`user\` WHERE ${where.join(' AND ')}`,
    params
  );
  return Number(rows[0].total || 0);
};

const updateAdmin = async (id, data, conn = null) => {
  const db = conn || pool;
  const fields = [];
  const values = [];

  if (data.full_name !== undefined || data.userName !== undefined) {
    fields.push('userName = ?');
    values.push(data.full_name ?? data.userName);
  }
  if (data.email !== undefined) {
    fields.push('email = ?');
    values.push(data.email);
  }
  if (data.phone !== undefined || data.phoneNumber !== undefined) {
    fields.push('phoneNumber = ?');
    values.push(data.phone ?? data.phoneNumber);
  }
  if (data.password_hash !== undefined || data.password !== undefined) {
    fields.push('password = ?');
    values.push(data.password_hash ?? data.password);
  }
  if (data.isVerified !== undefined) {
    fields.push('isVerified = ?');
    values.push(Number(Boolean(data.isVerified)));
  }
  if (data.role !== undefined) {
    fields.push('role = ?');
    values.push(data.role);
  }
  if (data.locationId !== undefined) {
    fields.push('locationId = ?');
    values.push(data.locationId);
  }

  if (!fields.length) return 0;

  values.push(String(id));
  const [res] = await db.query(
    `UPDATE \`user\`
     SET ${fields.join(', ')}
     WHERE id = ?`,
    values
  );
  return res.affectedRows;
};

const updateSelf = async (id, data) => {
  // Same real-schema update, but without role escalation by default.
  const payload = { ...data };
  if (payload.role !== undefined) {
    delete payload.role;
  }
  return updateAdmin(id, payload, pool);
};

const softDelete = async (id) => {
  // Real table has no deleted_at, so we hard-delete.
  const [res] = await pool.query('DELETE FROM `user` WHERE id = ?', [String(id)]);
  return res.affectedRows;
};

const listRoleIds = async () => {
  // No role mapping tables in real schema.
  return [];
};

const replaceRoles = async () => {
  // No user_roles table in real schema.
  return 0;
};

const getRolesAndPermissions = async (userId) => {
  const user = await findById(userId);
  if (!user) return { roles: [], permissions: [] };

  const roleName = user.role || 'user';
  const roles = [{ id: roleName, name: roleName }];
  const permissions = roleName === 'admin' ? [{ id: '*', code: '*' }] : [];
  return { roles, permissions };
};

const hasPermission = async (userId) => {
  const user = await findById(userId);
  return Boolean(user && user.role === 'admin');
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
