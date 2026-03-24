-- Electronics taxonomy + reusable attributes + sample products
-- Idempotent: safe to run multiple times.

SET @db := DATABASE();

-- Ensure category_attributes.sort_order exists.
SET @has_sort_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db
    AND TABLE_NAME = 'category_attributes'
    AND COLUMN_NAME = 'sort_order'
);
SET @sql := IF(
  @has_sort_col = 0,
  'ALTER TABLE category_attributes ADD COLUMN sort_order INT NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE stmt_sort FROM @sql;
EXECUTE stmt_sort;
DEALLOCATE PREPARE stmt_sort;

-- 1) Category tree
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT NULL, 'Electronics', 'electronics', 1, 5, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'electronics');

SET @cat_electronics := (SELECT id FROM categories WHERE slug = 'electronics' LIMIT 1);

INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_electronics, 'Phones & Tablets', 'electronics-phones-tablets', 1, 10, NOW(), NOW()
WHERE @cat_electronics IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'electronics-phones-tablets');

INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_electronics, 'Laptops & Desktops', 'electronics-computers', 1, 20, NOW(), NOW()
WHERE @cat_electronics IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'electronics-computers');

INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_electronics, 'Audio', 'electronics-audio', 1, 30, NOW(), NOW()
WHERE @cat_electronics IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'electronics-audio');

INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_electronics, 'Accessories', 'electronics-accessories', 1, 40, NOW(), NOW()
WHERE @cat_electronics IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'electronics-accessories');

SET @cat_pt := (SELECT id FROM categories WHERE slug = 'electronics-phones-tablets' LIMIT 1);
SET @cat_pc := (SELECT id FROM categories WHERE slug = 'electronics-computers' LIMIT 1);
SET @cat_audio := (SELECT id FROM categories WHERE slug = 'electronics-audio' LIMIT 1);
SET @cat_acc := (SELECT id FROM categories WHERE slug = 'electronics-accessories' LIMIT 1);

INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_pt, 'Smartphones', 'electronics-smartphones', 1, 10, NOW(), NOW()
WHERE @cat_pt IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'electronics-smartphones');

INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_pt, 'Tablets', 'electronics-tablets', 1, 20, NOW(), NOW()
WHERE @cat_pt IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'electronics-tablets');

INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_pc, 'Laptops', 'electronics-laptops', 1, 10, NOW(), NOW()
WHERE @cat_pc IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'electronics-laptops');

INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_pc, 'Desktops', 'electronics-desktops', 1, 20, NOW(), NOW()
WHERE @cat_pc IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'electronics-desktops');

INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_audio, 'Headphones', 'electronics-headphones', 1, 10, NOW(), NOW()
WHERE @cat_audio IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'electronics-headphones');

INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_audio, 'Earphones', 'electronics-earphones', 1, 20, NOW(), NOW()
WHERE @cat_audio IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'electronics-earphones');

INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_audio, 'Speakers', 'electronics-speakers', 1, 30, NOW(), NOW()
WHERE @cat_audio IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'electronics-speakers');

INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_acc, 'Chargers', 'electronics-chargers', 1, 10, NOW(), NOW()
WHERE @cat_acc IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'electronics-chargers');

INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_acc, 'Power Banks', 'electronics-power-banks', 1, 20, NOW(), NOW()
WHERE @cat_acc IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'electronics-power-banks');

INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_acc, 'Cables', 'electronics-cables', 1, 30, NOW(), NOW()
WHERE @cat_acc IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'electronics-cables');

-- 2) Reusable attributes
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
SELECT 'brand', 'Brand', 'text', NULL, NOW(), NOW(), NULL
WHERE NOT EXISTS (SELECT 1 FROM attributes WHERE code = 'brand');
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
SELECT 'model', 'Model', 'text', NULL, NOW(), NOW(), NULL
WHERE NOT EXISTS (SELECT 1 FROM attributes WHERE code = 'model');
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
SELECT 'color', 'Color', 'text', NULL, NOW(), NOW(), NULL
WHERE NOT EXISTS (SELECT 1 FROM attributes WHERE code = 'color');
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
SELECT 'warranty', 'Warranty', 'text', NULL, NOW(), NOW(), NULL
WHERE NOT EXISTS (SELECT 1 FROM attributes WHERE code = 'warranty');

INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
SELECT 'storage_capacity', 'Storage Capacity', 'select', NULL, NOW(), NOW(), NULL
WHERE NOT EXISTS (SELECT 1 FROM attributes WHERE code = 'storage_capacity');
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
SELECT 'ram', 'RAM', 'select', NULL, NOW(), NOW(), NULL
WHERE NOT EXISTS (SELECT 1 FROM attributes WHERE code = 'ram');
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
SELECT 'screen_size', 'Screen Size', 'text', NULL, NOW(), NOW(), NULL
WHERE NOT EXISTS (SELECT 1 FROM attributes WHERE code = 'screen_size');
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
SELECT 'battery_capacity', 'Battery Capacity', 'text', NULL, NOW(), NOW(), NULL
WHERE NOT EXISTS (SELECT 1 FROM attributes WHERE code = 'battery_capacity');

INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
SELECT 'processor', 'Processor', 'text', NULL, NOW(), NOW(), NULL
WHERE NOT EXISTS (SELECT 1 FROM attributes WHERE code = 'processor');
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
SELECT 'gpu', 'GPU', 'text', NULL, NOW(), NOW(), NULL
WHERE NOT EXISTS (SELECT 1 FROM attributes WHERE code = 'gpu');

INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
SELECT 'wireless', 'Wireless', 'boolean', NULL, NOW(), NOW(), NULL
WHERE NOT EXISTS (SELECT 1 FROM attributes WHERE code = 'wireless');
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
SELECT 'noise_cancellation', 'Noise Cancellation', 'boolean', NULL, NOW(), NOW(), NULL
WHERE NOT EXISTS (SELECT 1 FROM attributes WHERE code = 'noise_cancellation');
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
SELECT 'battery_life', 'Battery Life', 'text', NULL, NOW(), NOW(), NULL
WHERE NOT EXISTS (SELECT 1 FROM attributes WHERE code = 'battery_life');

INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
SELECT 'power', 'Power', 'text', NULL, NOW(), NOW(), NULL
WHERE NOT EXISTS (SELECT 1 FROM attributes WHERE code = 'power');
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
SELECT 'cable_type', 'Cable Type', 'select', NULL, NOW(), NOW(), NULL
WHERE NOT EXISTS (SELECT 1 FROM attributes WHERE code = 'cable_type');
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
SELECT 'capacity', 'Capacity', 'text', NULL, NOW(), NOW(), NULL
WHERE NOT EXISTS (SELECT 1 FROM attributes WHERE code = 'capacity');

SET @attr_brand := (SELECT id FROM attributes WHERE code = 'brand' LIMIT 1);
SET @attr_model := (SELECT id FROM attributes WHERE code = 'model' LIMIT 1);
SET @attr_color := (SELECT id FROM attributes WHERE code = 'color' LIMIT 1);
SET @attr_warranty := (SELECT id FROM attributes WHERE code = 'warranty' LIMIT 1);
SET @attr_storage := (SELECT id FROM attributes WHERE code = 'storage_capacity' LIMIT 1);
SET @attr_ram := (SELECT id FROM attributes WHERE code = 'ram' LIMIT 1);
SET @attr_screen := (SELECT id FROM attributes WHERE code = 'screen_size' LIMIT 1);
SET @attr_battery_capacity := (SELECT id FROM attributes WHERE code = 'battery_capacity' LIMIT 1);
SET @attr_processor := (SELECT id FROM attributes WHERE code = 'processor' LIMIT 1);
SET @attr_gpu := (SELECT id FROM attributes WHERE code = 'gpu' LIMIT 1);
SET @attr_wireless := (SELECT id FROM attributes WHERE code = 'wireless' LIMIT 1);
SET @attr_noise := (SELECT id FROM attributes WHERE code = 'noise_cancellation' LIMIT 1);
SET @attr_battery_life := (SELECT id FROM attributes WHERE code = 'battery_life' LIMIT 1);
SET @attr_power := (SELECT id FROM attributes WHERE code = 'power' LIMIT 1);
SET @attr_cable := (SELECT id FROM attributes WHERE code = 'cable_type' LIMIT 1);
SET @attr_capacity := (SELECT id FROM attributes WHERE code = 'capacity' LIMIT 1);

-- 3) Attribute options
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_storage, '64GB', 10
WHERE @attr_storage IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_storage AND value = '64GB');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_storage, '128GB', 20
WHERE @attr_storage IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_storage AND value = '128GB');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_storage, '256GB', 30
WHERE @attr_storage IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_storage AND value = '256GB');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_storage, '512GB', 40
WHERE @attr_storage IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_storage AND value = '512GB');

INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_ram, '4GB', 10
WHERE @attr_ram IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_ram AND value = '4GB');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_ram, '6GB', 20
WHERE @attr_ram IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_ram AND value = '6GB');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_ram, '8GB', 30
WHERE @attr_ram IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_ram AND value = '8GB');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_ram, '12GB', 40
WHERE @attr_ram IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_ram AND value = '12GB');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_ram, '16GB', 50
WHERE @attr_ram IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_ram AND value = '16GB');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_ram, '32GB', 60
WHERE @attr_ram IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_ram AND value = '32GB');

INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_cable, 'USB-C', 10
WHERE @attr_cable IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_cable AND value = 'USB-C');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_cable, 'Lightning', 20
WHERE @attr_cable IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_cable AND value = 'Lightning');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_cable, 'Micro USB', 30
WHERE @attr_cable IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_cable AND value = 'Micro USB');

-- 4) Link attributes by subcategory
SET @cat_smartphones := (SELECT id FROM categories WHERE slug = 'electronics-smartphones' LIMIT 1);
SET @cat_tablets := (SELECT id FROM categories WHERE slug = 'electronics-tablets' LIMIT 1);
SET @cat_laptops := (SELECT id FROM categories WHERE slug = 'electronics-laptops' LIMIT 1);
SET @cat_desktops := (SELECT id FROM categories WHERE slug = 'electronics-desktops' LIMIT 1);
SET @cat_headphones := (SELECT id FROM categories WHERE slug = 'electronics-headphones' LIMIT 1);
SET @cat_earphones := (SELECT id FROM categories WHERE slug = 'electronics-earphones' LIMIT 1);
SET @cat_speakers := (SELECT id FROM categories WHERE slug = 'electronics-speakers' LIMIT 1);
SET @cat_chargers := (SELECT id FROM categories WHERE slug = 'electronics-chargers' LIMIT 1);
SET @cat_power_banks := (SELECT id FROM categories WHERE slug = 'electronics-power-banks' LIMIT 1);
SET @cat_cables := (SELECT id FROM categories WHERE slug = 'electronics-cables' LIMIT 1);

-- helper: general attrs to all electronics leaf types
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_brand, 1, 10
FROM categories c
WHERE c.slug IN (
  'electronics-smartphones','electronics-tablets','electronics-laptops','electronics-desktops',
  'electronics-headphones','electronics-earphones','electronics-speakers',
  'electronics-chargers','electronics-power-banks','electronics-cables'
) AND @attr_brand IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes ca WHERE ca.category_id = c.id AND ca.attribute_id = @attr_brand);

INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_model, 1, 20
FROM categories c
WHERE c.slug IN (
  'electronics-smartphones','electronics-tablets','electronics-laptops','electronics-desktops',
  'electronics-headphones','electronics-earphones','electronics-speakers',
  'electronics-chargers','electronics-power-banks','electronics-cables'
) AND @attr_model IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes ca WHERE ca.category_id = c.id AND ca.attribute_id = @attr_model);

INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_color, 0, 30
FROM categories c
WHERE c.slug IN (
  'electronics-smartphones','electronics-tablets','electronics-laptops','electronics-desktops',
  'electronics-headphones','electronics-earphones','electronics-speakers',
  'electronics-chargers','electronics-power-banks','electronics-cables'
) AND @attr_color IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes ca WHERE ca.category_id = c.id AND ca.attribute_id = @attr_color);

INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_warranty, 1, 40
FROM categories c
WHERE c.slug IN (
  'electronics-smartphones','electronics-tablets','electronics-laptops','electronics-desktops',
  'electronics-headphones','electronics-earphones','electronics-speakers',
  'electronics-chargers','electronics-power-banks','electronics-cables'
) AND @attr_warranty IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes ca WHERE ca.category_id = c.id AND ca.attribute_id = @attr_warranty);

-- Smartphones/Tablets
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_storage, 0, 50
FROM categories c
WHERE c.slug IN ('electronics-smartphones', 'electronics-tablets') AND @attr_storage IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes ca WHERE ca.category_id = c.id AND ca.attribute_id = @attr_storage);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_ram, 0, 60
FROM categories c
WHERE c.slug IN ('electronics-smartphones', 'electronics-tablets') AND @attr_ram IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes ca WHERE ca.category_id = c.id AND ca.attribute_id = @attr_ram);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_screen, 1, 70
FROM categories c
WHERE c.slug IN ('electronics-smartphones', 'electronics-tablets') AND @attr_screen IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes ca WHERE ca.category_id = c.id AND ca.attribute_id = @attr_screen);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_battery_capacity, 1, 80
FROM categories c
WHERE c.slug IN ('electronics-smartphones', 'electronics-tablets') AND @attr_battery_capacity IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes ca WHERE ca.category_id = c.id AND ca.attribute_id = @attr_battery_capacity);

-- Laptops/Desktops
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_ram, 1, 50
FROM categories c
WHERE c.slug IN ('electronics-laptops', 'electronics-desktops') AND @attr_ram IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes ca WHERE ca.category_id = c.id AND ca.attribute_id = @attr_ram);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_storage, 1, 60
FROM categories c
WHERE c.slug IN ('electronics-laptops', 'electronics-desktops') AND @attr_storage IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes ca WHERE ca.category_id = c.id AND ca.attribute_id = @attr_storage);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_processor, 1, 70
FROM categories c
WHERE c.slug IN ('electronics-laptops', 'electronics-desktops') AND @attr_processor IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes ca WHERE ca.category_id = c.id AND ca.attribute_id = @attr_processor);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_gpu, 0, 80
FROM categories c
WHERE c.slug IN ('electronics-laptops', 'electronics-desktops') AND @attr_gpu IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes ca WHERE ca.category_id = c.id AND ca.attribute_id = @attr_gpu);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_screen, 0, 90
FROM categories c
WHERE c.slug IN ('electronics-laptops', 'electronics-desktops') AND @attr_screen IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes ca WHERE ca.category_id = c.id AND ca.attribute_id = @attr_screen);

-- Audio
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_wireless, 1, 50
FROM categories c
WHERE c.slug IN ('electronics-headphones', 'electronics-earphones', 'electronics-speakers') AND @attr_wireless IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes ca WHERE ca.category_id = c.id AND ca.attribute_id = @attr_wireless);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_noise, 0, 60
FROM categories c
WHERE c.slug IN ('electronics-headphones', 'electronics-earphones') AND @attr_noise IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes ca WHERE ca.category_id = c.id AND ca.attribute_id = @attr_noise);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_battery_life, 1, 70
FROM categories c
WHERE c.slug IN ('electronics-headphones', 'electronics-earphones', 'electronics-speakers') AND @attr_battery_life IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes ca WHERE ca.category_id = c.id AND ca.attribute_id = @attr_battery_life);

-- Accessories
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_power, 1, 50
FROM categories c
WHERE c.slug IN ('electronics-chargers', 'electronics-power-banks') AND @attr_power IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes ca WHERE ca.category_id = c.id AND ca.attribute_id = @attr_power);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_cable, 1, 60
FROM categories c
WHERE c.slug IN ('electronics-chargers', 'electronics-cables') AND @attr_cable IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes ca WHERE ca.category_id = c.id AND ca.attribute_id = @attr_cable);
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_capacity, 1, 70
FROM categories c
WHERE c.slug IN ('electronics-power-banks') AND @attr_capacity IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM category_attributes ca WHERE ca.category_id = c.id AND ca.attribute_id = @attr_capacity);

-- 5) Popular sample products (optional but useful for testing)
INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, created_at, updated_at)
SELECT @cat_smartphones, 'Galaxy S24', 'electronics-galaxy-s24', 'Flagship Android smartphone.', 3200000, 'SYP', 'EL-PH-S24', 1, NOW(), NOW()
WHERE @cat_smartphones IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'electronics-galaxy-s24');
INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, created_at, updated_at)
SELECT @cat_smartphones, 'iPhone 16', 'electronics-iphone-16', 'Latest iPhone generation.', 4600000, 'SYP', 'EL-PH-IP16', 1, NOW(), NOW()
WHERE @cat_smartphones IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'electronics-iphone-16');
INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, created_at, updated_at)
SELECT @cat_laptops, 'MacBook Air M3', 'electronics-macbook-air-m3', 'Ultra-light laptop with Apple Silicon.', 5200000, 'SYP', 'EL-LT-MBA-M3', 1, NOW(), NOW()
WHERE @cat_laptops IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'electronics-macbook-air-m3');
INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, created_at, updated_at)
SELECT @cat_laptops, 'Lenovo Legion 5', 'electronics-legion-5', 'Gaming laptop with dedicated GPU.', 6100000, 'SYP', 'EL-LT-LEG5', 1, NOW(), NOW()
WHERE @cat_laptops IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'electronics-legion-5');
INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, created_at, updated_at)
SELECT @cat_headphones, 'Sony WH-1000XM5', 'electronics-sony-xm5', 'Premium wireless noise-cancelling headphones.', 1450000, 'SYP', 'EL-AU-XM5', 1, NOW(), NOW()
WHERE @cat_headphones IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'electronics-sony-xm5');
INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, created_at, updated_at)
SELECT @cat_speakers, 'JBL Flip 6', 'electronics-jbl-flip-6', 'Portable bluetooth speaker.', 690000, 'SYP', 'EL-AU-JBL6', 1, NOW(), NOW()
WHERE @cat_speakers IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'electronics-jbl-flip-6');
INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, created_at, updated_at)
SELECT @cat_chargers, 'Anker 65W Charger', 'electronics-anker-65w', 'Fast USB-C wall charger.', 260000, 'SYP', 'EL-AC-ANK65', 1, NOW(), NOW()
WHERE @cat_chargers IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'electronics-anker-65w');
INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, created_at, updated_at)
SELECT @cat_power_banks, 'Xiaomi 20000mAh Power Bank', 'electronics-xiaomi-powerbank-20000', 'High-capacity power bank with quick charge.', 380000, 'SYP', 'EL-AC-XPB20', 1, NOW(), NOW()
WHERE @cat_power_banks IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'electronics-xiaomi-powerbank-20000');

INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, created_at, updated_at)
SELECT @cat_tablets, 'Galaxy Tab S9', 'electronics-galaxy-tab-s9', 'High-performance Android tablet.', 3000000, 'SYP', 'EL-TB-S9', 1, NOW(), NOW()
WHERE @cat_tablets IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'electronics-galaxy-tab-s9');
INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, created_at, updated_at)
SELECT @cat_desktops, 'HP Pavilion Desktop', 'electronics-hp-pavilion-desktop', 'Reliable desktop for work and study.', 3900000, 'SYP', 'EL-DS-HPPV', 1, NOW(), NOW()
WHERE @cat_desktops IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'electronics-hp-pavilion-desktop');
INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, created_at, updated_at)
SELECT @cat_earphones, 'Apple EarPods USB-C', 'electronics-apple-earpods-usbc', 'Wired earphones with USB-C connector.', 180000, 'SYP', 'EL-EP-AEPUSBC', 1, NOW(), NOW()
WHERE @cat_earphones IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'electronics-apple-earpods-usbc');
INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, created_at, updated_at)
SELECT @cat_cables, 'Baseus USB-C Cable 1m', 'electronics-baseus-usbc-cable', 'Durable data and charging cable.', 70000, 'SYP', 'EL-CB-BUSBC1M', 1, NOW(), NOW()
WHERE @cat_cables IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'electronics-baseus-usbc-cable');

-- Stock for all seeded electronics products
INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT id, 25, 0, NOW()
FROM products
WHERE slug IN (
  'electronics-galaxy-s24',
  'electronics-iphone-16',
  'electronics-galaxy-tab-s9',
  'electronics-macbook-air-m3',
  'electronics-legion-5',
  'electronics-hp-pavilion-desktop',
  'electronics-sony-xm5',
  'electronics-apple-earpods-usbc',
  'electronics-jbl-flip-6',
  'electronics-anker-65w',
  'electronics-xiaomi-powerbank-20000',
  'electronics-baseus-usbc-cable'
)
ON DUPLICATE KEY UPDATE
  quantity = VALUES(quantity),
  reserved_quantity = VALUES(reserved_quantity),
  updated_at = NOW();
