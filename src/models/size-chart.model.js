const pool = require('../config/db');

const listByCategoryId = async (categoryId) => {
  const [rows] = await pool.query(
    `SELECT id, category_id, size_code, chest_cm, waist_cm, hip_cm,
            shoulder_width_cm, sleeve_length_cm, shirt_length_cm, height_cm,
            sort_order, created_at, updated_at
     FROM size_charts
     WHERE category_id = ? AND deleted_at IS NULL
     ORDER BY sort_order ASC, id ASC`,
    [categoryId]
  );
  return rows;
};

const replaceForCategory = async (categoryId, rows, conn) => {
  const db = conn || pool;

  await db.query('UPDATE size_charts SET deleted_at = NOW() WHERE category_id = ? AND deleted_at IS NULL', [
    categoryId
  ]);

  if (!rows.length) return 0;

  const values = rows.map((row, index) => [
    categoryId,
    row.size_code,
    row.chest_cm || null,
    row.waist_cm || null,
    row.hip_cm || null,
    row.shoulder_width_cm || null,
    row.sleeve_length_cm || null,
    row.shirt_length_cm || null,
    row.height_cm || null,
    row.sort_order ?? index,
    new Date(),
    new Date(),
    null
  ]);

  const [res] = await db.query(
    `INSERT INTO size_charts (
      category_id, size_code, chest_cm, waist_cm, hip_cm,
      shoulder_width_cm, sleeve_length_cm, shirt_length_cm, height_cm,
      sort_order, created_at, updated_at, deleted_at
    ) VALUES ?`,
    [values]
  );

  return res.affectedRows;
};

module.exports = {
  listByCategoryId,
  replaceForCategory
};
