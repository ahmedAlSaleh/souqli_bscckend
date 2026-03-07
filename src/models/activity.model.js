const pool = require('../config/db');

const create = async ({ user_id, action, entity_type, entity_id, meta }) => {
  const [res] = await pool.query(
    'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, meta_json, created_at) VALUES (?,?,?,?,?,NOW())',
    [user_id || null, action, entity_type, entity_id || null, meta ? JSON.stringify(meta) : null]
  );
  return res.insertId;
};

const listPaginated = async ({ limit, offset, search, action, entityType, userId, dateFrom, dateTo }) => {
  const where = ['1=1'];
  const params = [];

  if (search) {
    const term = `%${search}%`;
    where.push('(al.action LIKE ? OR al.entity_type LIKE ? OR CAST(al.entity_id AS CHAR) LIKE ? OR u.email LIKE ?)');
    params.push(term, term, term, term);
  }

  if (action) {
    where.push('al.action = ?');
    params.push(action);
  }

  if (entityType) {
    where.push('al.entity_type = ?');
    params.push(entityType);
  }

  if (userId) {
    where.push('al.user_id = ?');
    params.push(userId);
  }

  if (dateFrom) {
    where.push('DATE(al.created_at) >= DATE(?)');
    params.push(dateFrom);
  }

  if (dateTo) {
    where.push('DATE(al.created_at) <= DATE(?)');
    params.push(dateTo);
  }

  params.push(limit, offset);

  const [rows] = await pool.query(
    `SELECT al.*, u.full_name AS user_name, u.email AS user_email
     FROM activity_logs al
     LEFT JOIN users u ON al.user_id = u.id
     WHERE ${where.join(' AND ')}
     ORDER BY al.created_at DESC
     LIMIT ? OFFSET ?`,
    params
  );
  return rows;
};

const countAll = async ({ search, action, entityType, userId, dateFrom, dateTo }) => {
  const where = ['1=1'];
  const params = [];

  if (search) {
    const term = `%${search}%`;
    where.push('(al.action LIKE ? OR al.entity_type LIKE ? OR CAST(al.entity_id AS CHAR) LIKE ? OR u.email LIKE ?)');
    params.push(term, term, term, term);
  }

  if (action) {
    where.push('al.action = ?');
    params.push(action);
  }

  if (entityType) {
    where.push('al.entity_type = ?');
    params.push(entityType);
  }

  if (userId) {
    where.push('al.user_id = ?');
    params.push(userId);
  }

  if (dateFrom) {
    where.push('DATE(al.created_at) >= DATE(?)');
    params.push(dateFrom);
  }

  if (dateTo) {
    where.push('DATE(al.created_at) <= DATE(?)');
    params.push(dateTo);
  }

  const [rows] = await pool.query(
    `SELECT COUNT(*) as total
     FROM activity_logs al
     LEFT JOIN users u ON al.user_id = u.id
     WHERE ${where.join(' AND ')}`,
    params
  );
  return rows[0].total;
};

module.exports = { create, listPaginated, countAll };
