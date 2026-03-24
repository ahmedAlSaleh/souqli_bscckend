-- Makeup demo products for testing
-- Idempotent and safe to run multiple times.

SET @cat_foundation := (SELECT id FROM categories WHERE slug = 'face-foundation' LIMIT 1);
SET @cat_mascara := (SELECT id FROM categories WHERE slug = 'eye-mascara' LIMIT 1);
SET @cat_lipstick := (SELECT id FROM categories WHERE slug = 'lip-lipstick' LIMIT 1);
SET @cat_gloss := (SELECT id FROM categories WHERE slug = 'lip-gloss' LIMIT 1);
SET @cat_serum := (SELECT id FROM categories WHERE slug = 'skincare-serum' LIMIT 1);
SET @cat_sunscreen := (SELECT id FROM categories WHERE slug = 'skincare-sunscreen' LIMIT 1);
SET @cat_polish := (SELECT id FROM categories WHERE slug = 'nail-polish' LIMIT 1);
SET @cat_brushes := (SELECT id FROM categories WHERE slug = 'tools-makeup-brushes' LIMIT 1);

INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, is_new, is_popular, created_at, updated_at)
SELECT @cat_foundation, 'Silk Finish Foundation', 'makeup-silk-finish-foundation',
       'Lightweight liquid foundation with natural finish.',
       75000, 'SYP', 'MK-FOUND-001', 1, 1, 1, NOW(), NOW()
WHERE @cat_foundation IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'makeup-silk-finish-foundation');

INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, is_new, is_popular, created_at, updated_at)
SELECT @cat_mascara, 'Ultra Volume Mascara', 'makeup-ultra-volume-mascara',
       'Long-wear mascara with deep black formula.',
       45000, 'SYP', 'MK-MASC-001', 1, 1, 1, NOW(), NOW()
WHERE @cat_mascara IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'makeup-ultra-volume-mascara');

INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, is_new, is_popular, created_at, updated_at)
SELECT @cat_lipstick, 'Velvet Matte Lipstick', 'makeup-velvet-matte-lipstick',
       'Rich matte lipstick with smooth application.',
       38000, 'SYP', 'MK-LIPS-001', 1, 1, 1, NOW(), NOW()
WHERE @cat_lipstick IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'makeup-velvet-matte-lipstick');

INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, is_new, is_popular, created_at, updated_at)
SELECT @cat_gloss, 'Crystal Lip Gloss', 'makeup-crystal-lip-gloss',
       'Glossy lip shine with soft texture.',
       32000, 'SYP', 'MK-GLOSS-001', 1, 1, 0, NOW(), NOW()
WHERE @cat_gloss IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'makeup-crystal-lip-gloss');

INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, is_new, is_popular, created_at, updated_at)
SELECT @cat_serum, 'Hydra Glow Serum', 'makeup-hydra-glow-serum',
       'Hydrating serum for daily skin routine.',
       92000, 'SYP', 'MK-SER-001', 1, 1, 1, NOW(), NOW()
WHERE @cat_serum IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'makeup-hydra-glow-serum');

INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, is_new, is_popular, created_at, updated_at)
SELECT @cat_sunscreen, 'Sun Guard SPF 50', 'makeup-sun-guard-spf50',
       'Broad-spectrum sunscreen SPF 50.',
       68000, 'SYP', 'MK-SUN-001', 1, 1, 1, NOW(), NOW()
WHERE @cat_sunscreen IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'makeup-sun-guard-spf50');

INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, is_new, is_popular, created_at, updated_at)
SELECT @cat_polish, 'Glossy Nail Polish', 'makeup-glossy-nail-polish',
       'Long-lasting nail polish.',
       22000, 'SYP', 'MK-NAIL-001', 1, 1, 0, NOW(), NOW()
WHERE @cat_polish IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'makeup-glossy-nail-polish');

INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, is_new, is_popular, created_at, updated_at)
SELECT @cat_brushes, 'Pro Brush Set', 'makeup-pro-brush-set',
       'Complete brush set for daily makeup.',
       88000, 'SYP', 'MK-BRUSH-001', 1, 1, 1, NOW(), NOW()
WHERE @cat_brushes IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'makeup-pro-brush-set');

-- Images
DELETE pi FROM product_images pi
JOIN products p ON p.id = pi.product_id
WHERE p.slug IN (
  'makeup-silk-finish-foundation','makeup-ultra-volume-mascara','makeup-velvet-matte-lipstick',
  'makeup-crystal-lip-gloss','makeup-hydra-glow-serum','makeup-sun-guard-spf50',
  'makeup-glossy-nail-polish','makeup-pro-brush-set'
);

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT id, 'https://images.unsplash.com/photo-1599733589046-fce3b4f4f58f?w=1000&q=80', 'Foundation', 1, 0, NOW()
FROM products WHERE slug = 'makeup-silk-finish-foundation';
INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT id, 'https://images.unsplash.com/photo-1583001809669-2f64f71f4f57?w=1000&q=80', 'Mascara', 1, 0, NOW()
FROM products WHERE slug = 'makeup-ultra-volume-mascara';
INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT id, 'https://images.unsplash.com/photo-1619451683461-49f72d2f0f0b?w=1000&q=80', 'Lipstick', 1, 0, NOW()
FROM products WHERE slug = 'makeup-velvet-matte-lipstick';
INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT id, 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=1000&q=80', 'Lip Gloss', 1, 0, NOW()
FROM products WHERE slug = 'makeup-crystal-lip-gloss';
INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT id, 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1000&q=80', 'Serum', 1, 0, NOW()
FROM products WHERE slug = 'makeup-hydra-glow-serum';
INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT id, 'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=1000&q=80', 'Sunscreen', 1, 0, NOW()
FROM products WHERE slug = 'makeup-sun-guard-spf50';
INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT id, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1000&q=80', 'Nail Polish', 1, 0, NOW()
FROM products WHERE slug = 'makeup-glossy-nail-polish';
INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT id, 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1000&q=80', 'Brush Set', 1, 0, NOW()
FROM products WHERE slug = 'makeup-pro-brush-set';

-- Stock
INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT id, 40, 0, NOW()
FROM products
WHERE slug IN (
  'makeup-silk-finish-foundation','makeup-ultra-volume-mascara','makeup-velvet-matte-lipstick',
  'makeup-crystal-lip-gloss','makeup-hydra-glow-serum','makeup-sun-guard-spf50',
  'makeup-glossy-nail-polish','makeup-pro-brush-set'
)
ON DUPLICATE KEY UPDATE
  quantity = VALUES(quantity),
  reserved_quantity = VALUES(reserved_quantity),
  updated_at = NOW();
