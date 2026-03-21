const pool = require('../config/db');

const listPaginated = async ({ limit, offset }) => {
  const [rows] = await pool.query(
    'SELECT * FROM categories WHERE deleted_at IS NULL ORDER BY sort_order ASC, id DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
  return rows;
};

const listSubcategoriesPaginated = async ({ limit, offset }) => {
  const [rows] = await pool.query(
    `SELECT c.*, p.name AS parent_name
     FROM categories c
     JOIN categories p ON c.parent_id = p.id
     WHERE c.deleted_at IS NULL AND c.parent_id IS NOT NULL
     ORDER BY c.sort_order ASC, c.id DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return rows;
};

const countSubcategories = async () => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as total FROM categories WHERE deleted_at IS NULL AND parent_id IS NOT NULL'
  );
  return rows[0].total;
};

const countAll = async () => {
  const [rows] = await pool.query('SELECT COUNT(*) as total FROM categories WHERE deleted_at IS NULL');
  return rows[0].total;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM categories WHERE id = ? AND deleted_at IS NULL LIMIT 1',
    [id]
  );
  return rows[0];
};

const isMainCategory = async (id) => {
  const category = await findById(id);
  if (!category) return false;
  return category.parent_id === null;
};

const isSubcategory = async (id) => {
  const category = await findById(id);
  if (!category) return false;
  return category.parent_id !== null;
};

const create = async ({ parent_id, name, slug, is_active, sort_order, image_url }) => {
  const [res] = await pool.query(
    'INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at) VALUES (?,?,?,?,?,?,NOW(),NOW())',
    [parent_id || null, name, image_url || null, slug, is_active ?? true, sort_order ?? 0]
  );
  return res.insertId;
};

const update = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.parent_id !== undefined) {
    fields.push('parent_id = ?');
    values.push(data.parent_id || null);
  }
  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.image_url !== undefined) {
    fields.push('image_url = ?');
    values.push(data.image_url || null);
  }
  if (data.slug !== undefined) {
    fields.push('slug = ?');
    values.push(data.slug);
  }
  if (data.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(data.is_active);
  }
  if (data.sort_order !== undefined) {
    fields.push('sort_order = ?');
    values.push(data.sort_order);
  }

  if (!fields.length) return 0;

  values.push(id);
  const [res] = await pool.query(
    `UPDATE categories SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
    values
  );
  return res.affectedRows;
};

const softDelete = async (id) => {
  const [res] = await pool.query(
    'UPDATE categories SET deleted_at = NOW(), is_active = 0 WHERE id = ? AND deleted_at IS NULL',
    [id]
  );
  return res.affectedRows;
};

const listForTree = async () => {
  const [rows] = await pool.query(
    `WITH RECURSIVE category_scope AS (
        SELECT c.id AS root_id, c.id AS category_id
        FROM categories c
        WHERE c.deleted_at IS NULL AND c.is_active = 1
        UNION ALL
        SELECT scope.root_id, child.id
        FROM category_scope scope
        JOIN categories child ON child.parent_id = scope.category_id
        WHERE child.deleted_at IS NULL AND child.is_active = 1
      )
      SELECT c.*,
             COUNT(DISTINCT p.id) AS product_count
      FROM categories c
      LEFT JOIN category_scope scope ON scope.root_id = c.id
      LEFT JOIN products p ON p.category_id = scope.category_id AND p.deleted_at IS NULL
      WHERE c.deleted_at IS NULL AND c.is_active = 1
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC`
  );
  return rows;
};

module.exports = {
  listPaginated,
  listSubcategoriesPaginated,
  countSubcategories,
  countAll,
  findById,
  isMainCategory,
  isSubcategory,
  create,
  update,
  softDelete,
  listForTree
};
