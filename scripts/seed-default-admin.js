require('dotenv').config();

const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

const DEFAULT_ADMIN = {
  email: 'admin@souqli.shop',
  password: 'Admin12345!',
  full_name: 'Souqli Admin',
  role_name: 'ADMIN'
};

const seedDefaultAdmin = async () => {
  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO roles (name, description, created_at, updated_at)
       VALUES (?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE updated_at = NOW()`,
      [DEFAULT_ADMIN.role_name, 'Full access']
    );

    const [roleRows] = await conn.query('SELECT id FROM roles WHERE name = ? LIMIT 1', [
      DEFAULT_ADMIN.role_name
    ]);
    const roleId = roleRows[0]?.id;
    if (!roleId) {
      throw new Error(`Role ${DEFAULT_ADMIN.role_name} not found`);
    }

    const [existing] = await conn.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [DEFAULT_ADMIN.email]
    );

    let userId;
    let created = false;

    if (existing.length) {
      userId = existing[0].id;
      await conn.query(
        `UPDATE users
         SET full_name = ?,
             password_hash = ?,
             is_active = 1,
             email_verified_at = COALESCE(email_verified_at, NOW()),
             deleted_at = NULL,
             updated_at = NOW()
         WHERE id = ?`,
        [DEFAULT_ADMIN.full_name, passwordHash, userId]
      );
    } else {
      const [result] = await conn.query(
        `INSERT INTO users
          (full_name, email, password_hash, email_verified_at, is_active, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), 1, NOW(), NOW())`,
        [DEFAULT_ADMIN.full_name, DEFAULT_ADMIN.email, passwordHash]
      );
      userId = result.insertId;
      created = true;
    }

    await conn.query(
      'INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)',
      [userId, roleId]
    );

    await conn.commit();
    return { created, id: userId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const main = async () => {
  try {
    const result = await seedDefaultAdmin();
    if (result.created) {
      console.log(`Default admin created (id=${result.id})`);
    } else {
      console.log(`Default admin updated (id=${result.id})`);
    }
    console.log(`email: ${DEFAULT_ADMIN.email}`);
    console.log(`password: ${DEFAULT_ADMIN.password}`);
  } catch (err) {
    console.error('Failed to seed default admin:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

main();
