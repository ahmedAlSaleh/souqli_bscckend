const pool = require('../config/db');

const create = async ({ full_name, email, phone, reason, source }) => {
  const [result] = await pool.query(
    `INSERT INTO account_deletion_requests
      (full_name, email, phone, reason, source, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'PENDING', NOW(), NOW())`,
    [full_name, email || null, phone || null, reason, source || 'play_store_form']
  );

  return result.insertId;
};

module.exports = {
  create
};
