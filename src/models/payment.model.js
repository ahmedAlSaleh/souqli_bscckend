const pool = require('../config/db');

const listPaginated = async ({ limit, offset, search, status, orderId }) => {
  const where = ['1=1'];
  const params = [];

  if (status) {
    where.push('p.status = ?');
    params.push(status);
  }

  if (orderId) {
    where.push('p.order_id = ?');
    params.push(orderId);
  }

  if (search) {
    const term = `%${search}%`;
    where.push('(CAST(p.id AS CHAR) LIKE ? OR CAST(p.order_id AS CHAR) LIKE ? OR p.transaction_id LIKE ? OR u.email LIKE ?)');
    params.push(term, term, term, term);
  }

  params.push(limit, offset);

  const [rows] = await pool.query(
    `SELECT
       p.*,
       o.user_id,
       u.full_name AS user_full_name,
       u.email AS user_email
     FROM payments p
     JOIN orders o ON o.id = p.order_id
     LEFT JOIN users u ON u.id = o.user_id
     WHERE ${where.join(' AND ')}
     ORDER BY p.created_at DESC, p.id DESC
     LIMIT ? OFFSET ?`,
    params
  );

  return rows;
};

const countAll = async ({ search, status, orderId }) => {
  const where = ['1=1'];
  const params = [];

  if (status) {
    where.push('p.status = ?');
    params.push(status);
  }

  if (orderId) {
    where.push('p.order_id = ?');
    params.push(orderId);
  }

  if (search) {
    const term = `%${search}%`;
    where.push('(CAST(p.id AS CHAR) LIKE ? OR CAST(p.order_id AS CHAR) LIKE ? OR p.transaction_id LIKE ? OR u.email LIKE ?)');
    params.push(term, term, term, term);
  }

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM payments p
     JOIN orders o ON o.id = p.order_id
     LEFT JOIN users u ON u.id = o.user_id
     WHERE ${where.join(' AND ')}`,
    params
  );

  return rows[0].total;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT
       p.*,
       o.user_id,
       u.full_name AS user_full_name,
       u.email AS user_email
     FROM payments p
     JOIN orders o ON o.id = p.order_id
     LEFT JOIN users u ON u.id = o.user_id
     WHERE p.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const create = async ({ order_id, payment_method, transaction_id, amount, currency, status }, conn = null) => {
  const db = conn || pool;
  const [res] = await db.query(
    `INSERT INTO payments
      (order_id, payment_method, transaction_id, amount, currency, status, created_at)
     VALUES (?,?,?,?,?,?,NOW())`,
    [
      order_id,
      payment_method || null,
      transaction_id || null,
      amount,
      currency || 'USD',
      status || 'PENDING'
    ]
  );
  return res.insertId;
};

const update = async (id, data, conn = null) => {
  const db = conn || pool;
  const fields = [];
  const values = [];

  if (data.order_id !== undefined) {
    fields.push('order_id = ?');
    values.push(data.order_id);
  }
  if (data.payment_method !== undefined) {
    fields.push('payment_method = ?');
    values.push(data.payment_method || null);
  }
  if (data.transaction_id !== undefined) {
    fields.push('transaction_id = ?');
    values.push(data.transaction_id || null);
  }
  if (data.amount !== undefined) {
    fields.push('amount = ?');
    values.push(data.amount);
  }
  if (data.currency !== undefined) {
    fields.push('currency = ?');
    values.push(data.currency || 'USD');
  }
  if (data.status !== undefined) {
    fields.push('status = ?');
    values.push(data.status || null);
  }

  if (!fields.length) return 0;

  values.push(id);
  const [res] = await db.query(`UPDATE payments SET ${fields.join(', ')} WHERE id = ?`, values);
  return res.affectedRows;
};

const remove = async (id, conn = null) => {
  const db = conn || pool;
  const [res] = await db.query('DELETE FROM payments WHERE id = ?', [id]);
  return res.affectedRows;
};

module.exports = {
  listPaginated,
  countAll,
  findById,
  create,
  update,
  remove
};
