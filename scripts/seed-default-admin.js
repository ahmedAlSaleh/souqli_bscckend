require('dotenv').config();

const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

const DEFAULT_ADMIN = {
  email: 'admin@souqli.shop',
  password: 'Admin12345!',
  userName: 'Souqli Admin',
  role: 'admin'
};

const seedDefaultAdmin = async () => {
  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

  const [existing] = await pool.query(
    'SELECT id FROM `user` WHERE email = ? LIMIT 1',
    [DEFAULT_ADMIN.email]
  );

  if (existing.length) {
    const adminId = existing[0].id;
    await pool.query(
      `UPDATE \`user\`
       SET userName = ?, password = ?, role = ?, isVerified = 1
       WHERE id = ?`,
      [DEFAULT_ADMIN.userName, passwordHash, DEFAULT_ADMIN.role, adminId]
    );
    return { created: false, id: adminId };
  }

  const id = randomUUID();
  await pool.query(
    `INSERT INTO \`user\`
      (id, email, userName, phoneNumber, password, createdAt, isVerified, role, locationId)
     VALUES (?, ?, ?, ?, ?, NOW(6), ?, ?, ?)`,
    [
      id,
      DEFAULT_ADMIN.email,
      DEFAULT_ADMIN.userName,
      null,
      passwordHash,
      1,
      DEFAULT_ADMIN.role,
      null
    ]
  );

  return { created: true, id };
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
