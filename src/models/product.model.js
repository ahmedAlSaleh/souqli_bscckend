const pool = require('../config/db');

const getDb = (conn) => conn || pool;

const listStore = async ({
  limit,
  offset,
  search,
  categoryId,
  minPrice,
  maxPrice,
  isNew,
  isPopular,
  isDeal,
  sort,
  city
}) => {
  const where = ['p.deleted_at IS NULL', 'p.is_active = 1'];
  const params = [];
  let joins = '';
  let categoryScopeCte = '';

  if (search) {
    where.push('(p.name LIKE ? OR p.description LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term);
  }

  if (categoryId) {
    categoryScopeCte = `
      WITH RECURSIVE category_scope AS (
        SELECT id
        FROM categories
        WHERE id = ?
          AND deleted_at IS NULL
        UNION ALL
        SELECT c.id
        FROM categories c
        JOIN category_scope cs ON c.parent_id = cs.id
        WHERE c.deleted_at IS NULL
      )`;
    where.push('p.category_id IN (SELECT id FROM category_scope)');
    params.push(Number(categoryId));
  }

  if (minPrice !== undefined) {
    where.push('p.base_price >= ?');
    params.push(Number(minPrice));
  }
  if (maxPrice !== undefined) {
    where.push('p.base_price <= ?');
    params.push(Number(maxPrice));
  }
  if (isNew === true) {
    where.push('p.is_new = 1');
  }
  if (isPopular === true) {
    where.push('p.is_popular = 1');
  }
  if (isDeal === true) {
    where.push('p.is_deal = 1');
    where.push('(p.deal_start_at IS NULL OR p.deal_start_at <= NOW())');
    where.push('(p.deal_end_at IS NULL OR p.deal_end_at >= NOW())');
  }

  if (city) {
    joins += `
      JOIN store_products sp ON sp.product_id = p.id AND sp.deleted_at IS NULL
      JOIN stores s ON s.id = sp.store_id AND s.deleted_at IS NULL`;
    where.push('s.city = ?');
    params.push(city);
  }

  let orderBy = 'p.created_at DESC';
  if (sort === 'price_asc') orderBy = 'p.base_price ASC';
  if (sort === 'price_desc') orderBy = 'p.base_price DESC';
  if (sort === 'newest') orderBy = 'p.created_at DESC';

  const sql = `
    ${categoryScopeCte}
    SELECT DISTINCT p.id, p.name, p.slug, p.base_price, p.currency, p.category_id,
           p.is_active, p.is_new, p.is_deal, p.deal_price, p.is_popular, p.created_at,
           COALESCE(pr.rating_avg, 0) AS rating_avg,
           COALESCE(pr.rating_count, 0) AS rating_count,
           pi.url AS primary_image
    FROM products p
    ${joins}
    LEFT JOIN (
      SELECT product_id, AVG(rating) AS rating_avg, COUNT(*) AS rating_count
      FROM product_reviews
      WHERE deleted_at IS NULL
      GROUP BY product_id
    ) pr ON pr.product_id = p.id
    LEFT JOIN product_images pi
      ON pi.product_id = p.id AND pi.is_primary = 1 AND pi.deleted_at IS NULL
    WHERE ${where.join(' AND ')}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const [rows] = await pool.query(sql, params);
  return rows;
};

const countStore = async ({
  search,
  categoryId,
  minPrice,
  maxPrice,
  isNew,
  isPopular,
  isDeal,
  city
}) => {
  const where = ['p.deleted_at IS NULL', 'p.is_active = 1'];
  const params = [];
  let joins = '';
  let categoryScopeCte = '';

  if (search) {
    where.push('(p.name LIKE ? OR p.description LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term);
  }

  if (categoryId) {
    categoryScopeCte = `
      WITH RECURSIVE category_scope AS (
        SELECT id
        FROM categories
        WHERE id = ?
          AND deleted_at IS NULL
        UNION ALL
        SELECT c.id
        FROM categories c
        JOIN category_scope cs ON c.parent_id = cs.id
        WHERE c.deleted_at IS NULL
      )`;
    where.push('p.category_id IN (SELECT id FROM category_scope)');
    params.push(Number(categoryId));
  }

  if (minPrice !== undefined) {
    where.push('p.base_price >= ?');
    params.push(Number(minPrice));
  }
  if (maxPrice !== undefined) {
    where.push('p.base_price <= ?');
    params.push(Number(maxPrice));
  }
  if (isNew === true) {
    where.push('p.is_new = 1');
  }
  if (isPopular === true) {
    where.push('p.is_popular = 1');
  }
  if (isDeal === true) {
    where.push('p.is_deal = 1');
    where.push('(p.deal_start_at IS NULL OR p.deal_start_at <= NOW())');
    where.push('(p.deal_end_at IS NULL OR p.deal_end_at >= NOW())');
  }

  if (city) {
    joins += `
      JOIN store_products sp ON sp.product_id = p.id AND sp.deleted_at IS NULL
      JOIN stores s ON s.id = sp.store_id AND s.deleted_at IS NULL`;
    where.push('s.city = ?');
    params.push(city);
  }

  const [rows] = await pool.query(
    `${categoryScopeCte}
     SELECT COUNT(DISTINCT p.id) AS total
     FROM products p
     ${joins}
     WHERE ${where.join(' AND ')}`,
    params
  );
  return rows[0].total;
};

const listAdmin = async ({ limit, offset }) => {
  const [rows] = await pool.query(
    `SELECT p.*, pi.url AS primary_image
     FROM products p
     LEFT JOIN product_images pi
       ON pi.product_id = p.id AND pi.is_primary = 1 AND pi.deleted_at IS NULL
     WHERE p.deleted_at IS NULL
     ORDER BY p.id DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return rows;
};

const countAdmin = async () => {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM products WHERE deleted_at IS NULL');
  return rows[0].total;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name,
            ps.quantity AS stock_quantity,
            ps.reserved_quantity AS stock_reserved,
            COALESCE(pr.rating_avg, 0) AS rating_avg,
            COALESCE(pr.rating_count, 0) AS rating_count
     FROM products p
     JOIN categories c ON p.category_id = c.id
     LEFT JOIN product_stock ps ON ps.product_id = p.id
     LEFT JOIN (
       SELECT product_id, AVG(rating) AS rating_avg, COUNT(*) AS rating_count
       FROM product_reviews
       WHERE deleted_at IS NULL
       GROUP BY product_id
     ) pr ON pr.product_id = p.id
     WHERE p.id = ? AND p.deleted_at IS NULL
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const create = async (data, conn) => {
  const db = getDb(conn);
  const [res] = await db.query(
    `INSERT INTO products (
      category_id, name, slug, description, base_price, currency, sku, is_active,
      is_new, is_deal, deal_price, deal_start_at, deal_end_at, is_popular, sort_order,
      created_at, updated_at
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
    [
      data.category_id,
      data.name,
      data.slug,
      data.description || null,
      data.base_price ?? 0,
      data.currency || 'USD',
      data.sku || null,
      data.is_active ?? true,
      data.is_new ?? false,
      data.is_deal ?? false,
      data.deal_price ?? null,
      data.deal_start_at || null,
      data.deal_end_at || null,
      data.is_popular ?? false,
      data.sort_order ?? 0
    ]
  );
  return res.insertId;
};

const update = async (id, data, conn) => {
  const fields = [];
  const values = [];

  if (data.category_id !== undefined) {
    fields.push('category_id = ?');
    values.push(data.category_id);
  }
  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.slug !== undefined) {
    fields.push('slug = ?');
    values.push(data.slug);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    values.push(data.description);
  }
  if (data.base_price !== undefined) {
    fields.push('base_price = ?');
    values.push(data.base_price);
  }
  if (data.currency !== undefined) {
    fields.push('currency = ?');
    values.push(data.currency);
  }
  if (data.sku !== undefined) {
    fields.push('sku = ?');
    values.push(data.sku);
  }
  if (data.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(data.is_active);
  }
  if (data.is_new !== undefined) {
    fields.push('is_new = ?');
    values.push(data.is_new);
  }
  if (data.is_deal !== undefined) {
    fields.push('is_deal = ?');
    values.push(data.is_deal);
  }
  if (data.deal_price !== undefined) {
    fields.push('deal_price = ?');
    values.push(data.deal_price);
  }
  if (data.deal_start_at !== undefined) {
    fields.push('deal_start_at = ?');
    values.push(data.deal_start_at);
  }
  if (data.deal_end_at !== undefined) {
    fields.push('deal_end_at = ?');
    values.push(data.deal_end_at);
  }
  if (data.is_popular !== undefined) {
    fields.push('is_popular = ?');
    values.push(data.is_popular);
  }
  if (data.sort_order !== undefined) {
    fields.push('sort_order = ?');
    values.push(data.sort_order);
  }

  if (!fields.length) return 0;

  values.push(id);
  const db = getDb(conn);
  const [res] = await db.query(
    `UPDATE products SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
    values
  );
  return res.affectedRows;
};

const softDelete = async (id) => {
  const [res] = await pool.query(
    'UPDATE products SET deleted_at = NOW(), is_active = 0 WHERE id = ? AND deleted_at IS NULL',
    [id]
  );
  return res.affectedRows;
};

const replaceImages = async (productId, images, conn) => {
  const db = getDb(conn);
  await db.query(
    'UPDATE product_images SET deleted_at = NOW() WHERE product_id = ? AND deleted_at IS NULL',
    [productId]
  );

  if (!images || !images.length) return 0;

  const normalized = images.map((img, index) => ({
    url: img.url,
    alt: img.alt || null,
    is_primary: img.is_primary !== undefined ? img.is_primary : index === 0,
    sort_order: img.sort_order ?? index
  }));

  const values = normalized.map((img) => [
    productId,
    img.url,
    img.alt,
    img.is_primary ? 1 : 0,
    img.sort_order,
    new Date()
  ]);

  const [res] = await db.query(
    'INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at) VALUES ?',
    [values]
  );
  return res.affectedRows;
};

const getImagesByProductId = async (productId) => {
  const [rows] = await pool.query(
    'SELECT * FROM product_images WHERE product_id = ? AND deleted_at IS NULL ORDER BY is_primary DESC, sort_order ASC',
    [productId]
  );
  return rows;
};

const getAttributesByProductId = async (productId) => {
  const [rows] = await pool.query(
    `SELECT pav.id, pav.attribute_id, a.code, a.name, a.data_type, a.unit,
            pav.value_text, pav.value_number, pav.value_boolean, pav.value_date,
            pav.option_id, ao.value AS option_value
     FROM product_attribute_values pav
     JOIN attributes a ON pav.attribute_id = a.id
     LEFT JOIN attribute_options ao ON pav.option_id = ao.id
     WHERE pav.product_id = ? AND a.deleted_at IS NULL
     ORDER BY a.name ASC`,
    [productId]
  );
  return rows;
};

const upsertAttributes = async (productId, attributes, conn) => {
  if (!attributes || !attributes.length) return 0;
  const db = getDb(conn);
  const now = new Date();
  const values = attributes.map((attr) => [
    productId,
    attr.attribute_id,
    attr.value_text ?? null,
    attr.value_number ?? null,
    attr.value_boolean ?? null,
    attr.value_date ?? null,
    attr.option_id ?? null,
    now,
    now
  ]);

  const sql = `INSERT INTO product_attribute_values
    (product_id, attribute_id, value_text, value_number, value_boolean, value_date, option_id, created_at, updated_at)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      value_text = VALUES(value_text),
      value_number = VALUES(value_number),
      value_boolean = VALUES(value_boolean),
      value_date = VALUES(value_date),
      option_id = VALUES(option_id),
      updated_at = VALUES(updated_at)`;

  const [res] = await db.query(sql, [values]);
  return res.affectedRows;
};

const findVariantById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM product_variants WHERE id = ? AND deleted_at IS NULL AND is_active = 1 LIMIT 1',
    [id]
  );
  return rows[0];
};

const getStockByProductId = async (productId) => {
  const [rows] = await pool.query(
    'SELECT quantity, reserved_quantity FROM product_stock WHERE product_id = ? LIMIT 1',
    [productId]
  );
  return rows[0] || { quantity: 0, reserved_quantity: 0 };
};

const listSection = async ({ section, limit = 6 }) => {
  const where = ['p.deleted_at IS NULL', 'p.is_active = 1'];
  const params = [];

  if (section === 'new') {
    where.push('p.is_new = 1');
  }
  if (section === 'popular') {
    where.push('p.is_popular = 1');
  }
  if (section === 'deal') {
    where.push('p.is_deal = 1');
    where.push('(p.deal_start_at IS NULL OR p.deal_start_at <= NOW())');
    where.push('(p.deal_end_at IS NULL OR p.deal_end_at >= NOW())');
  }

  const sql = `
    SELECT p.id, p.name, p.slug, p.base_price, p.currency, p.category_id,
           p.is_new, p.is_deal, p.deal_price, p.deal_start_at, p.deal_end_at, p.is_popular,
           p.sort_order, p.created_at,
           COALESCE(pr.rating_avg, 0) AS rating_avg,
           COALESCE(pr.rating_count, 0) AS rating_count,
           pi.url AS primary_image
    FROM products p
    LEFT JOIN (
      SELECT product_id, AVG(rating) AS rating_avg, COUNT(*) AS rating_count
      FROM product_reviews
      WHERE deleted_at IS NULL
      GROUP BY product_id
    ) pr ON pr.product_id = p.id
    LEFT JOIN product_images pi
      ON pi.product_id = p.id AND pi.is_primary = 1 AND pi.deleted_at IS NULL
    WHERE ${where.join(' AND ')}
    ORDER BY p.sort_order DESC, p.created_at DESC
    LIMIT ?`;

  params.push(limit);
  const [rows] = await pool.query(sql, params);
  return rows;
};

module.exports = {
  listStore,
  countStore,
  listAdmin,
  countAdmin,
  findById,
  create,
  update,
  softDelete,
  replaceImages,
  getImagesByProductId,
  getAttributesByProductId,
  upsertAttributes,
  findVariantById,
  listSection,
  getStockByProductId
};
