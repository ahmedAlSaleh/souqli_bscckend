require('dotenv').config();

const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Check DB connection before accepting traffic.
    await pool.query('SELECT 1');
    app.listen(PORT, () => {
      console.log(`Souqli API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to the database:', err.message);
    process.exit(1);
  }
};

startServer();
