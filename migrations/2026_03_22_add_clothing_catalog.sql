-- Clothing taxonomy, attributes, size chart, and sample products
-- Safe to run multiple times.

CREATE TABLE IF NOT EXISTS size_charts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  category_id BIGINT NOT NULL,
  size_code VARCHAR(20) NOT NULL,
  chest_cm VARCHAR(30) NULL,
  waist_cm VARCHAR(30) NULL,
  hip_cm VARCHAR(30) NULL,
  shoulder_width_cm VARCHAR(30) NULL,
  sleeve_length_cm VARCHAR(30) NULL,
  shirt_length_cm VARCHAR(30) NULL,
  height_cm VARCHAR(30) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uq_size_charts_category_size (category_id, size_code),
  KEY idx_size_charts_category (category_id, deleted_at, sort_order),
  CONSTRAINT size_charts_fk_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1) Category tree:
-- Clothing (primary) -> Men's -> Sweaters/Shirts/Jackets -> Hoodies
INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT NULL, 'Clothing', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80', 'clothing', 1, 10, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'clothing');

SET @cat_clothing := (SELECT id FROM categories WHERE slug = 'clothing' LIMIT 1);

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_clothing, 'Men''s', 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=1200&q=80', 'mens', 1, 10, NOW(), NOW()
WHERE @cat_clothing IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'mens');

SET @cat_mens := (SELECT id FROM categories WHERE slug = 'mens' LIMIT 1);

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_mens, 'Sweaters', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&q=80', 'mens-sweaters', 1, 10, NOW(), NOW()
WHERE @cat_mens IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'mens-sweaters');

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_mens, 'Shirts', 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=1200&q=80', 'mens-shirts', 1, 20, NOW(), NOW()
WHERE @cat_mens IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'mens-shirts');

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_mens, 'Jackets', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&q=80', 'mens-jackets', 1, 30, NOW(), NOW()
WHERE @cat_mens IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'mens-jackets');

SET @cat_sweaters := (SELECT id FROM categories WHERE slug = 'mens-sweaters' LIMIT 1);

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_sweaters, 'Hoodies', 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=1200&q=80', 'mens-hoodies', 1, 10, NOW(), NOW()
WHERE @cat_sweaters IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'mens-hoodies');

-- Keep structure consistent if categories already existed.
UPDATE categories SET parent_id = @cat_clothing, is_active = 1, updated_at = NOW() WHERE slug = 'mens';
SET @cat_mens := (SELECT id FROM categories WHERE slug = 'mens' LIMIT 1);
UPDATE categories SET parent_id = @cat_mens, is_active = 1, updated_at = NOW() WHERE slug = 'mens-sweaters';
UPDATE categories SET parent_id = @cat_mens, is_active = 1, updated_at = NOW() WHERE slug = 'mens-shirts';
UPDATE categories SET parent_id = @cat_mens, is_active = 1, updated_at = NOW() WHERE slug = 'mens-jackets';
SET @cat_sweaters := (SELECT id FROM categories WHERE slug = 'mens-sweaters' LIMIT 1);
UPDATE categories SET parent_id = @cat_sweaters, is_active = 1, updated_at = NOW() WHERE slug = 'mens-hoodies';

SET @cat_shirts := (SELECT id FROM categories WHERE slug = 'mens-shirts' LIMIT 1);
SET @cat_jackets := (SELECT id FROM categories WHERE slug = 'mens-jackets' LIMIT 1);
SET @cat_hoodies := (SELECT id FROM categories WHERE slug = 'mens-hoodies' LIMIT 1);

-- 2) Attributes
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at)
SELECT 'size', 'Size', 'select', NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM attributes WHERE code = 'size' AND deleted_at IS NULL);

INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at)
SELECT 'season', 'Season', 'select', NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM attributes WHERE code = 'season' AND deleted_at IS NULL);

INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at)
SELECT 'chest', 'Chest', 'text', 'cm', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM attributes WHERE code = 'chest' AND deleted_at IS NULL);

SET @attr_size := (SELECT id FROM attributes WHERE code = 'size' AND deleted_at IS NULL LIMIT 1);
SET @attr_season := (SELECT id FROM attributes WHERE code = 'season' AND deleted_at IS NULL LIMIT 1);
SET @attr_chest := (SELECT id FROM attributes WHERE code = 'chest' AND deleted_at IS NULL LIMIT 1);

-- 3) Attribute options
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_size, 'XS', 1
WHERE @attr_size IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_size AND value = 'XS');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_size, 'S', 2
WHERE @attr_size IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_size AND value = 'S');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_size, 'M', 3
WHERE @attr_size IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_size AND value = 'M');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_size, 'L', 4
WHERE @attr_size IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_size AND value = 'L');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_size, 'XL', 5
WHERE @attr_size IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_size AND value = 'XL');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_size, 'XXL', 6
WHERE @attr_size IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_size AND value = 'XXL');

INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_season, 'Summer', 1
WHERE @attr_season IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_season AND value = 'Summer');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_season, 'Winter', 2
WHERE @attr_season IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_season AND value = 'Winter');

SET @size_opt_s := (SELECT id FROM attribute_options WHERE attribute_id = @attr_size AND value = 'S' LIMIT 1);
SET @size_opt_m := (SELECT id FROM attribute_options WHERE attribute_id = @attr_size AND value = 'M' LIMIT 1);
SET @size_opt_l := (SELECT id FROM attribute_options WHERE attribute_id = @attr_size AND value = 'L' LIMIT 1);
SET @size_opt_xl := (SELECT id FROM attribute_options WHERE attribute_id = @attr_size AND value = 'XL' LIMIT 1);
SET @season_opt_summer := (SELECT id FROM attribute_options WHERE attribute_id = @attr_season AND value = 'Summer' LIMIT 1);
SET @season_opt_winter := (SELECT id FROM attribute_options WHERE attribute_id = @attr_season AND value = 'Winter' LIMIT 1);

-- 4) Link attributes to clothing categories (template)
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT @cat_mens, @attr_size, 1, 10
WHERE @cat_mens IS NOT NULL AND @attr_size IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes WHERE category_id = @cat_mens AND attribute_id = @attr_size);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT @cat_mens, @attr_season, 1, 20
WHERE @cat_mens IS NOT NULL AND @attr_season IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes WHERE category_id = @cat_mens AND attribute_id = @attr_season);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT @cat_mens, @attr_chest, 0, 30
WHERE @cat_mens IS NOT NULL AND @attr_chest IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes WHERE category_id = @cat_mens AND attribute_id = @attr_chest);

INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT @cat_sweaters, @attr_size, 1, 10
WHERE @cat_sweaters IS NOT NULL AND @attr_size IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes WHERE category_id = @cat_sweaters AND attribute_id = @attr_size);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT @cat_sweaters, @attr_season, 1, 20
WHERE @cat_sweaters IS NOT NULL AND @attr_season IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes WHERE category_id = @cat_sweaters AND attribute_id = @attr_season);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT @cat_sweaters, @attr_chest, 0, 30
WHERE @cat_sweaters IS NOT NULL AND @attr_chest IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes WHERE category_id = @cat_sweaters AND attribute_id = @attr_chest);

INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT @cat_shirts, @attr_size, 1, 10
WHERE @cat_shirts IS NOT NULL AND @attr_size IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes WHERE category_id = @cat_shirts AND attribute_id = @attr_size);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT @cat_shirts, @attr_season, 1, 20
WHERE @cat_shirts IS NOT NULL AND @attr_season IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes WHERE category_id = @cat_shirts AND attribute_id = @attr_season);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT @cat_shirts, @attr_chest, 0, 30
WHERE @cat_shirts IS NOT NULL AND @attr_chest IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes WHERE category_id = @cat_shirts AND attribute_id = @attr_chest);

INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT @cat_jackets, @attr_size, 1, 10
WHERE @cat_jackets IS NOT NULL AND @attr_size IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes WHERE category_id = @cat_jackets AND attribute_id = @attr_size);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT @cat_jackets, @attr_season, 1, 20
WHERE @cat_jackets IS NOT NULL AND @attr_season IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes WHERE category_id = @cat_jackets AND attribute_id = @attr_season);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT @cat_jackets, @attr_chest, 0, 30
WHERE @cat_jackets IS NOT NULL AND @attr_chest IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes WHERE category_id = @cat_jackets AND attribute_id = @attr_chest);

INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT @cat_hoodies, @attr_size, 1, 10
WHERE @cat_hoodies IS NOT NULL AND @attr_size IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes WHERE category_id = @cat_hoodies AND attribute_id = @attr_size);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT @cat_hoodies, @attr_season, 1, 20
WHERE @cat_hoodies IS NOT NULL AND @attr_season IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes WHERE category_id = @cat_hoodies AND attribute_id = @attr_season);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT @cat_hoodies, @attr_chest, 0, 30
WHERE @cat_hoodies IS NOT NULL AND @attr_chest IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes WHERE category_id = @cat_hoodies AND attribute_id = @attr_chest);

-- 5) Sample clothing products
INSERT INTO products (
  category_id, name, slug, description, base_price, currency, sku, is_active,
  is_new, is_deal, deal_price, deal_start_at, deal_end_at, is_popular, sort_order, created_at, updated_at
)
SELECT @cat_sweaters,
       'Short-sleeve Sweater',
       'short-sleeve-sweater',
       'Lightweight men''s short-sleeve sweater for summer styling.',
       125000,
       'SYP',
       'CLOTH-SS-SWEATER',
       1,
       1,
       0,
       NULL,
       NULL,
       NULL,
       1,
       10,
       NOW(),
       NOW()
WHERE @cat_sweaters IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'short-sleeve-sweater');

INSERT INTO products (
  category_id, name, slug, description, base_price, currency, sku, is_active,
  is_new, is_deal, deal_price, deal_start_at, deal_end_at, is_popular, sort_order, created_at, updated_at
)
SELECT @cat_shirts,
       'Casual Shirt',
       'casual-shirt',
       'Breathable casual shirt for daily wear.',
       98000,
       'SYP',
       'CLOTH-CASUAL-SHIRT',
       1,
       1,
       1,
       86000,
       NOW(),
       DATE_ADD(NOW(), INTERVAL 30 DAY),
       1,
       20,
       NOW(),
       NOW()
WHERE @cat_shirts IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'casual-shirt');

INSERT INTO products (
  category_id, name, slug, description, base_price, currency, sku, is_active,
  is_new, is_deal, deal_price, deal_start_at, deal_end_at, is_popular, sort_order, created_at, updated_at
)
SELECT @cat_hoodies,
       'Hoodie',
       'hoodie',
       'Warm hoodie with fleece lining for winter.',
       160000,
       'SYP',
       'CLOTH-HOODIE',
       1,
       1,
       0,
       NULL,
       NULL,
       NULL,
       1,
       30,
       NOW(),
       NOW()
WHERE @cat_hoodies IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'hoodie');

INSERT INTO products (
  category_id, name, slug, description, base_price, currency, sku, is_active,
  is_new, is_deal, deal_price, deal_start_at, deal_end_at, is_popular, sort_order, created_at, updated_at
)
SELECT @cat_jackets,
       'Jacket',
       'jacket',
       'Winter-ready jacket with windproof outer shell.',
       210000,
       'SYP',
       'CLOTH-JACKET',
       1,
       0,
       1,
       180000,
       NOW(),
       DATE_ADD(NOW(), INTERVAL 20 DAY),
       1,
       40,
       NOW(),
       NOW()
WHERE @cat_jackets IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'jacket');

SET @product_sweater := (SELECT id FROM products WHERE slug = 'short-sleeve-sweater' LIMIT 1);
SET @product_shirt := (SELECT id FROM products WHERE slug = 'casual-shirt' LIMIT 1);
SET @product_hoodie := (SELECT id FROM products WHERE slug = 'hoodie' LIMIT 1);
SET @product_jacket := (SELECT id FROM products WHERE slug = 'jacket' LIMIT 1);

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT @product_sweater, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80', 'Short-sleeve sweater', 1, 0, NOW()
WHERE @product_sweater IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = @product_sweater AND is_primary = 1 AND deleted_at IS NULL);

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT @product_shirt, 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=1200&q=80', 'Casual shirt', 1, 0, NOW()
WHERE @product_shirt IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = @product_shirt AND is_primary = 1 AND deleted_at IS NULL);

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT @product_hoodie, 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=1200&q=80', 'Hoodie', 1, 0, NOW()
WHERE @product_hoodie IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = @product_hoodie AND is_primary = 1 AND deleted_at IS NULL);

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT @product_jacket, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&q=80', 'Jacket', 1, 0, NOW()
WHERE @product_jacket IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = @product_jacket AND is_primary = 1 AND deleted_at IS NULL);

INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT @product_sweater, 40, 2, NOW()
WHERE @product_sweater IS NOT NULL
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity), updated_at = VALUES(updated_at);

INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT @product_shirt, 55, 3, NOW()
WHERE @product_shirt IS NOT NULL
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity), updated_at = VALUES(updated_at);

INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT @product_hoodie, 65, 4, NOW()
WHERE @product_hoodie IS NOT NULL
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity), updated_at = VALUES(updated_at);

INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT @product_jacket, 30, 1, NOW()
WHERE @product_jacket IS NOT NULL
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity), updated_at = VALUES(updated_at);

-- product attribute values (so attributes show in mobile/product details)
INSERT INTO product_attribute_values (
  product_id, attribute_id, value_text, value_number, value_boolean, value_date, option_id, created_at, updated_at
)
SELECT @product_sweater, @attr_size, NULL, NULL, NULL, NULL, @size_opt_m, NOW(), NOW()
WHERE @product_sweater IS NOT NULL AND @attr_size IS NOT NULL
ON DUPLICATE KEY UPDATE option_id = VALUES(option_id), updated_at = VALUES(updated_at);

INSERT INTO product_attribute_values (
  product_id, attribute_id, value_text, value_number, value_boolean, value_date, option_id, created_at, updated_at
)
SELECT @product_sweater, @attr_season, NULL, NULL, NULL, NULL, @season_opt_summer, NOW(), NOW()
WHERE @product_sweater IS NOT NULL AND @attr_season IS NOT NULL
ON DUPLICATE KEY UPDATE option_id = VALUES(option_id), updated_at = VALUES(updated_at);

INSERT INTO product_attribute_values (
  product_id, attribute_id, value_text, value_number, value_boolean, value_date, option_id, created_at, updated_at
)
SELECT @product_sweater, @attr_chest, '94-100', NULL, NULL, NULL, NULL, NOW(), NOW()
WHERE @product_sweater IS NOT NULL AND @attr_chest IS NOT NULL
ON DUPLICATE KEY UPDATE value_text = VALUES(value_text), updated_at = VALUES(updated_at);

INSERT INTO product_attribute_values (
  product_id, attribute_id, value_text, value_number, value_boolean, value_date, option_id, created_at, updated_at
)
SELECT @product_shirt, @attr_size, NULL, NULL, NULL, NULL, @size_opt_l, NOW(), NOW()
WHERE @product_shirt IS NOT NULL AND @attr_size IS NOT NULL
ON DUPLICATE KEY UPDATE option_id = VALUES(option_id), updated_at = VALUES(updated_at);

INSERT INTO product_attribute_values (
  product_id, attribute_id, value_text, value_number, value_boolean, value_date, option_id, created_at, updated_at
)
SELECT @product_shirt, @attr_season, NULL, NULL, NULL, NULL, @season_opt_summer, NOW(), NOW()
WHERE @product_shirt IS NOT NULL AND @attr_season IS NOT NULL
ON DUPLICATE KEY UPDATE option_id = VALUES(option_id), updated_at = VALUES(updated_at);

INSERT INTO product_attribute_values (
  product_id, attribute_id, value_text, value_number, value_boolean, value_date, option_id, created_at, updated_at
)
SELECT @product_shirt, @attr_chest, '100-106', NULL, NULL, NULL, NULL, NOW(), NOW()
WHERE @product_shirt IS NOT NULL AND @attr_chest IS NOT NULL
ON DUPLICATE KEY UPDATE value_text = VALUES(value_text), updated_at = VALUES(updated_at);

INSERT INTO product_attribute_values (
  product_id, attribute_id, value_text, value_number, value_boolean, value_date, option_id, created_at, updated_at
)
SELECT @product_hoodie, @attr_size, NULL, NULL, NULL, NULL, @size_opt_xl, NOW(), NOW()
WHERE @product_hoodie IS NOT NULL AND @attr_size IS NOT NULL
ON DUPLICATE KEY UPDATE option_id = VALUES(option_id), updated_at = VALUES(updated_at);

INSERT INTO product_attribute_values (
  product_id, attribute_id, value_text, value_number, value_boolean, value_date, option_id, created_at, updated_at
)
SELECT @product_hoodie, @attr_season, NULL, NULL, NULL, NULL, @season_opt_winter, NOW(), NOW()
WHERE @product_hoodie IS NOT NULL AND @attr_season IS NOT NULL
ON DUPLICATE KEY UPDATE option_id = VALUES(option_id), updated_at = VALUES(updated_at);

INSERT INTO product_attribute_values (
  product_id, attribute_id, value_text, value_number, value_boolean, value_date, option_id, created_at, updated_at
)
SELECT @product_hoodie, @attr_chest, '106-112', NULL, NULL, NULL, NULL, NOW(), NOW()
WHERE @product_hoodie IS NOT NULL AND @attr_chest IS NOT NULL
ON DUPLICATE KEY UPDATE value_text = VALUES(value_text), updated_at = VALUES(updated_at);

INSERT INTO product_attribute_values (
  product_id, attribute_id, value_text, value_number, value_boolean, value_date, option_id, created_at, updated_at
)
SELECT @product_jacket, @attr_size, NULL, NULL, NULL, NULL, @size_opt_l, NOW(), NOW()
WHERE @product_jacket IS NOT NULL AND @attr_size IS NOT NULL
ON DUPLICATE KEY UPDATE option_id = VALUES(option_id), updated_at = VALUES(updated_at);

INSERT INTO product_attribute_values (
  product_id, attribute_id, value_text, value_number, value_boolean, value_date, option_id, created_at, updated_at
)
SELECT @product_jacket, @attr_season, NULL, NULL, NULL, NULL, @season_opt_winter, NOW(), NOW()
WHERE @product_jacket IS NOT NULL AND @attr_season IS NOT NULL
ON DUPLICATE KEY UPDATE option_id = VALUES(option_id), updated_at = VALUES(updated_at);

INSERT INTO product_attribute_values (
  product_id, attribute_id, value_text, value_number, value_boolean, value_date, option_id, created_at, updated_at
)
SELECT @product_jacket, @attr_chest, '100-106', NULL, NULL, NULL, NULL, NOW(), NOW()
WHERE @product_jacket IS NOT NULL AND @attr_chest IS NOT NULL
ON DUPLICATE KEY UPDATE value_text = VALUES(value_text), updated_at = VALUES(updated_at);

-- 6) Optional store mapping for seeded products
SET @default_store := (SELECT id FROM stores WHERE deleted_at IS NULL ORDER BY id ASC LIMIT 1);

INSERT INTO store_products (store_id, product_id, stock, price_override, is_available, created_at, updated_at)
SELECT @default_store, @product_sweater, 20, NULL, 1, NOW(), NOW()
WHERE @default_store IS NOT NULL AND @product_sweater IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM store_products WHERE store_id = @default_store AND product_id = @product_sweater);

INSERT INTO store_products (store_id, product_id, stock, price_override, is_available, created_at, updated_at)
SELECT @default_store, @product_shirt, 22, 90000, 1, NOW(), NOW()
WHERE @default_store IS NOT NULL AND @product_shirt IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM store_products WHERE store_id = @default_store AND product_id = @product_shirt);

INSERT INTO store_products (store_id, product_id, stock, price_override, is_available, created_at, updated_at)
SELECT @default_store, @product_hoodie, 18, NULL, 1, NOW(), NOW()
WHERE @default_store IS NOT NULL AND @product_hoodie IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM store_products WHERE store_id = @default_store AND product_id = @product_hoodie);

INSERT INTO store_products (store_id, product_id, stock, price_override, is_available, created_at, updated_at)
SELECT @default_store, @product_jacket, 12, NULL, 1, NOW(), NOW()
WHERE @default_store IS NOT NULL AND @product_jacket IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM store_products WHERE store_id = @default_store AND product_id = @product_jacket);

-- 7) Size chart rows for hoodies subcategory
INSERT INTO size_charts (
  category_id, size_code, chest_cm, waist_cm, hip_cm, shoulder_width_cm,
  sleeve_length_cm, shirt_length_cm, height_cm, sort_order, created_at, updated_at
)
SELECT @cat_hoodies, 'XS', '84-88', '70-74', '86-90', '42', '58', '68', '165-170', 1, NOW(), NOW()
WHERE @cat_hoodies IS NOT NULL
ON DUPLICATE KEY UPDATE
  chest_cm = VALUES(chest_cm),
  waist_cm = VALUES(waist_cm),
  hip_cm = VALUES(hip_cm),
  shoulder_width_cm = VALUES(shoulder_width_cm),
  sleeve_length_cm = VALUES(sleeve_length_cm),
  shirt_length_cm = VALUES(shirt_length_cm),
  height_cm = VALUES(height_cm),
  sort_order = VALUES(sort_order),
  updated_at = VALUES(updated_at);

INSERT INTO size_charts (
  category_id, size_code, chest_cm, waist_cm, hip_cm, shoulder_width_cm,
  sleeve_length_cm, shirt_length_cm, height_cm, sort_order, created_at, updated_at
)
SELECT @cat_hoodies, 'S', '88-94', '74-80', '90-96', '44', '60', '70', '168-172', 2, NOW(), NOW()
WHERE @cat_hoodies IS NOT NULL
ON DUPLICATE KEY UPDATE
  chest_cm = VALUES(chest_cm),
  waist_cm = VALUES(waist_cm),
  hip_cm = VALUES(hip_cm),
  shoulder_width_cm = VALUES(shoulder_width_cm),
  sleeve_length_cm = VALUES(sleeve_length_cm),
  shirt_length_cm = VALUES(shirt_length_cm),
  height_cm = VALUES(height_cm),
  sort_order = VALUES(sort_order),
  updated_at = VALUES(updated_at);

INSERT INTO size_charts (
  category_id, size_code, chest_cm, waist_cm, hip_cm, shoulder_width_cm,
  sleeve_length_cm, shirt_length_cm, height_cm, sort_order, created_at, updated_at
)
SELECT @cat_hoodies, 'M', '94-100', '80-86', '96-102', '46', '62', '72', '170-176', 3, NOW(), NOW()
WHERE @cat_hoodies IS NOT NULL
ON DUPLICATE KEY UPDATE
  chest_cm = VALUES(chest_cm),
  waist_cm = VALUES(waist_cm),
  hip_cm = VALUES(hip_cm),
  shoulder_width_cm = VALUES(shoulder_width_cm),
  sleeve_length_cm = VALUES(sleeve_length_cm),
  shirt_length_cm = VALUES(shirt_length_cm),
  height_cm = VALUES(height_cm),
  sort_order = VALUES(sort_order),
  updated_at = VALUES(updated_at);

INSERT INTO size_charts (
  category_id, size_code, chest_cm, waist_cm, hip_cm, shoulder_width_cm,
  sleeve_length_cm, shirt_length_cm, height_cm, sort_order, created_at, updated_at
)
SELECT @cat_hoodies, 'L', '100-106', '86-92', '102-108', '48', '64', '74', '172-178', 4, NOW(), NOW()
WHERE @cat_hoodies IS NOT NULL
ON DUPLICATE KEY UPDATE
  chest_cm = VALUES(chest_cm),
  waist_cm = VALUES(waist_cm),
  hip_cm = VALUES(hip_cm),
  shoulder_width_cm = VALUES(shoulder_width_cm),
  sleeve_length_cm = VALUES(sleeve_length_cm),
  shirt_length_cm = VALUES(shirt_length_cm),
  height_cm = VALUES(height_cm),
  sort_order = VALUES(sort_order),
  updated_at = VALUES(updated_at);

INSERT INTO size_charts (
  category_id, size_code, chest_cm, waist_cm, hip_cm, shoulder_width_cm,
  sleeve_length_cm, shirt_length_cm, height_cm, sort_order, created_at, updated_at
)
SELECT @cat_hoodies, 'XL', '106-112', '92-98', '108-114', '50', '66', '76', '174-180', 5, NOW(), NOW()
WHERE @cat_hoodies IS NOT NULL
ON DUPLICATE KEY UPDATE
  chest_cm = VALUES(chest_cm),
  waist_cm = VALUES(waist_cm),
  hip_cm = VALUES(hip_cm),
  shoulder_width_cm = VALUES(shoulder_width_cm),
  sleeve_length_cm = VALUES(sleeve_length_cm),
  shirt_length_cm = VALUES(shirt_length_cm),
  height_cm = VALUES(height_cm),
  sort_order = VALUES(sort_order),
  updated_at = VALUES(updated_at);

INSERT INTO size_charts (
  category_id, size_code, chest_cm, waist_cm, hip_cm, shoulder_width_cm,
  sleeve_length_cm, shirt_length_cm, height_cm, sort_order, created_at, updated_at
)
SELECT @cat_hoodies, 'XXL', '112-118', '98-104', '114-120', '52', '68', '78', '176-182', 6, NOW(), NOW()
WHERE @cat_hoodies IS NOT NULL
ON DUPLICATE KEY UPDATE
  chest_cm = VALUES(chest_cm),
  waist_cm = VALUES(waist_cm),
  hip_cm = VALUES(hip_cm),
  shoulder_width_cm = VALUES(shoulder_width_cm),
  sleeve_length_cm = VALUES(sleeve_length_cm),
  shirt_length_cm = VALUES(shirt_length_cm),
  height_cm = VALUES(height_cm),
  sort_order = VALUES(sort_order),
  updated_at = VALUES(updated_at);
