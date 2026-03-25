-- Dummy catalog seeding: Makeup + Sports + Home + Electronics
-- Creates/updates dashboard admin role linkage (user record handled by seed:admin script)
-- Safe to run multiple times.

-- 1) Ensure main categories exist
INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT NULL, 'Makeup', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80', 'makeup', 1, 20, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'makeup');

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT NULL, 'Electronics', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80', 'electronics', 1, 10, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'electronics');

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT NULL, 'Sports', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80', 'sports', 1, 30, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sports');

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT NULL, 'Home', 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1200&q=80', 'home', 1, 40, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'home');

SET @sports_id := (SELECT id FROM categories WHERE slug = 'sports' LIMIT 1);
SET @home_id := (SELECT id FROM categories WHERE slug = 'home' LIMIT 1);

-- 2) Sports subcategories
INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @sports_id, 'Fitness', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=1200&q=80', 'sports-fitness', 1, 10, NOW(), NOW()
WHERE @sports_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sports-fitness');

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @sports_id, 'Outdoor', 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&q=80', 'sports-outdoor', 1, 20, NOW(), NOW()
WHERE @sports_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sports-outdoor');

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @sports_id, 'Football', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80', 'sports-football', 1, 30, NOW(), NOW()
WHERE @sports_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sports-football');

-- 3) Home subcategories
INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @home_id, 'Kitchen', 'https://images.unsplash.com/photo-1556909211-36987daf7b4d?w=1200&q=80', 'home-kitchen', 1, 10, NOW(), NOW()
WHERE @home_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'home-kitchen');

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @home_id, 'Furniture', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80', 'home-furniture', 1, 20, NOW(), NOW()
WHERE @home_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'home-furniture');

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @home_id, 'Decor', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80', 'home-decor', 1, 30, NOW(), NOW()
WHERE @home_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'home-decor');

-- 4) Build templates for "3 products per subcategory"
DROP TEMPORARY TABLE IF EXISTS tmp_dummy_templates;
CREATE TEMPORARY TABLE tmp_dummy_templates (
  sub_slug VARCHAR(160) NOT NULL,
  product_prefix VARCHAR(190) NOT NULL,
  slug_prefix VARCHAR(220) NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500) NOT NULL
);

-- Makeup leaf subcategories
INSERT INTO tmp_dummy_templates (sub_slug, product_prefix, slug_prefix, base_price, image_url) VALUES
('face-foundation', 'Foundation', 'demo-face-foundation', 65000, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000&q=80'),
('face-concealer', 'Concealer', 'demo-face-concealer', 52000, 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=1000&q=80'),
('face-powder', 'Face Powder', 'demo-face-powder', 42000, 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=1000&q=80'),
('face-blush', 'Blush', 'demo-face-blush', 38000, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1000&q=80'),
('face-highlighter', 'Highlighter', 'demo-face-highlighter', 45000, 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=1000&q=80'),
('eye-mascara', 'Mascara', 'demo-eye-mascara', 36000, 'https://images.unsplash.com/photo-1583001809669-2f64f71f4f57?w=1000&q=80'),
('eye-eyeliner', 'Eyeliner', 'demo-eye-eyeliner', 31000, 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=1000&q=80'),
('eye-pencil', 'Eye Pencil', 'demo-eye-pencil', 26000, 'https://images.unsplash.com/photo-1631214540242-0a5f3d4dbe3d?w=1000&q=80'),
('eye-eyeshadow', 'Eyeshadow', 'demo-eye-eyeshadow', 47000, 'https://images.unsplash.com/photo-1617897903246-719242758050?w=1000&q=80'),
('lip-lipstick', 'Lipstick', 'demo-lip-lipstick', 35000, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=1000&q=80'),
('lip-gloss', 'Lip Gloss', 'demo-lip-gloss', 29000, 'https://images.unsplash.com/photo-1631730486572-6b11f4f5c41d?w=1000&q=80'),
('lip-moisturizing-cream', 'Lip Cream', 'demo-lip-cream', 28000, 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1000&q=80'),
('skincare-serum', 'Serum', 'demo-skincare-serum', 78000, 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1000&q=80'),
('skincare-sunscreen', 'Sunscreen', 'demo-skincare-sunscreen', 55000, 'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=1000&q=80'),
('nail-polish', 'Nail Polish', 'demo-nail-polish', 22000, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1000&q=80'),
('nail-care', 'Nail Care', 'demo-nail-care', 19000, 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=1000&q=80'),
('nail-polish-remover', 'Polish Remover', 'demo-nail-remover', 15000, 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=1000&q=80'),
('nail-file', 'Nail File', 'demo-nail-file', 12000, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1000&q=80'),
('tools-makeup-brushes', 'Makeup Brush Set', 'demo-tools-brush-set', 48000, 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1000&q=80'),
('tools-makeup-tools', 'Makeup Tool Kit', 'demo-tools-kit', 52000, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1000&q=80'),
('tools-makeup-sponge', 'Makeup Sponge', 'demo-tools-sponge', 9000, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000&q=80'),
('tools-makeup-bag', 'Makeup Bag', 'demo-tools-bag', 27000, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&q=80');

-- Electronics leaf subcategories
INSERT INTO tmp_dummy_templates (sub_slug, product_prefix, slug_prefix, base_price, image_url) VALUES
('electronics-smartphones', 'Smartphone', 'demo-electronics-smartphone', 2800000, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000&q=80'),
('electronics-tablets', 'Tablet', 'demo-electronics-tablet', 1900000, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1000&q=80'),
('electronics-laptops', 'Laptop', 'demo-electronics-laptop', 4200000, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1000&q=80'),
('electronics-desktops', 'Desktop PC', 'demo-electronics-desktop', 3900000, 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=1000&q=80'),
('electronics-headphones', 'Headphones', 'demo-electronics-headphones', 260000, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=80'),
('electronics-earphones', 'Earphones', 'demo-electronics-earphones', 180000, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=1000&q=80'),
('electronics-speakers', 'Speaker', 'demo-electronics-speaker', 320000, 'https://images.unsplash.com/photo-1512446816042-444d64126786?w=1000&q=80'),
('electronics-chargers', 'Charger', 'demo-electronics-charger', 95000, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=1000&q=80'),
('electronics-power-banks', 'Power Bank', 'demo-electronics-powerbank', 210000, 'https://images.unsplash.com/photo-1609592831643-0cb61f0f7f8a?w=1000&q=80'),
('electronics-cables', 'Cable', 'demo-electronics-cable', 45000, 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1000&q=80');

-- Sports + Home subcategories
INSERT INTO tmp_dummy_templates (sub_slug, product_prefix, slug_prefix, base_price, image_url) VALUES
('sports-fitness', 'Fitness Gear', 'demo-sports-fitness', 145000, 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=1000&q=80'),
('sports-outdoor', 'Outdoor Item', 'demo-sports-outdoor', 175000, 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1000&q=80'),
('sports-football', 'Football Item', 'demo-sports-football', 115000, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&q=80'),
('home-kitchen', 'Kitchen Item', 'demo-home-kitchen', 98000, 'https://images.unsplash.com/photo-1556909211-36987daf7b4d?w=1000&q=80'),
('home-furniture', 'Furniture Item', 'demo-home-furniture', 285000, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1000&q=80'),
('home-decor', 'Decor Item', 'demo-home-decor', 87000, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1000&q=80');

-- 5) Insert 3 products per subcategory template
INSERT INTO products (
  category_id, name, slug, description, base_price, currency, sku, is_active, created_at, updated_at
)
SELECT
  c.id,
  CONCAT(t.product_prefix, ' ', n.idx),
  CONCAT(t.slug_prefix, '-', n.idx),
  CONCAT('Dummy data for ', t.product_prefix, ' #', n.idx),
  t.base_price + ((n.idx - 1) * 5000),
  'SYP',
  CONCAT('DM-', c.id, '-', n.idx),
  1,
  NOW(), NOW()
FROM tmp_dummy_templates t
JOIN categories c ON c.slug = t.sub_slug AND c.deleted_at IS NULL
JOIN (
  SELECT 1 AS idx
  UNION ALL SELECT 2
  UNION ALL SELECT 3
) n
WHERE NOT EXISTS (
  SELECT 1 FROM products p WHERE p.slug = CONCAT(t.slug_prefix, '-', n.idx)
);

-- 6) Ensure one primary image per seeded product
INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT
  p.id,
  t.image_url,
  CONCAT(p.name, ' image'),
  1,
  0,
  NOW()
FROM products p
JOIN categories c ON c.id = p.category_id
JOIN tmp_dummy_templates t ON t.sub_slug = c.slug
WHERE p.slug LIKE CONCAT(t.slug_prefix, '-%')
  AND NOT EXISTS (
    SELECT 1 FROM product_images pi
    WHERE pi.product_id = p.id AND pi.is_primary = 1 AND pi.deleted_at IS NULL
  );

-- 7) Ensure stock exists for seeded products
INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT p.id, 30, 0, NOW()
FROM products p
JOIN categories c ON c.id = p.category_id
JOIN tmp_dummy_templates t ON t.sub_slug = c.slug
WHERE p.slug LIKE CONCAT(t.slug_prefix, '-%')
ON DUPLICATE KEY UPDATE
  quantity = GREATEST(product_stock.quantity, VALUES(quantity)),
  reserved_quantity = LEAST(product_stock.reserved_quantity, GREATEST(product_stock.quantity, VALUES(quantity))),
  updated_at = NOW();

DROP TEMPORARY TABLE IF EXISTS tmp_dummy_templates;
