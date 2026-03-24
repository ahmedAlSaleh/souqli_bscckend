-- Makeup taxonomy + attribute templates
-- Safe to run multiple times.

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

-- 1) Main category
INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
VALUES (NULL, 'Makeup', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80', 'makeup', 1, 20, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  image_url = VALUES(image_url),
  is_active = VALUES(is_active),
  sort_order = VALUES(sort_order),
  updated_at = NOW(),
  deleted_at = NULL;

SET @cat_makeup := (SELECT id FROM categories WHERE slug = 'makeup' LIMIT 1);

-- 2) Level-2 groups
INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_makeup, 'Face Makeup', NULL, 'makeup-face', 1, 10, NOW(), NOW()
WHERE @cat_makeup IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), is_active = VALUES(is_active), sort_order = VALUES(sort_order), updated_at = NOW(), deleted_at = NULL;

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_makeup, 'Eye Makeup', NULL, 'makeup-eye', 1, 20, NOW(), NOW()
WHERE @cat_makeup IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), is_active = VALUES(is_active), sort_order = VALUES(sort_order), updated_at = NOW(), deleted_at = NULL;

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_makeup, 'Lip Makeup', NULL, 'makeup-lip', 1, 30, NOW(), NOW()
WHERE @cat_makeup IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), is_active = VALUES(is_active), sort_order = VALUES(sort_order), updated_at = NOW(), deleted_at = NULL;

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_makeup, 'Skin Care', NULL, 'makeup-skincare', 1, 40, NOW(), NOW()
WHERE @cat_makeup IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), is_active = VALUES(is_active), sort_order = VALUES(sort_order), updated_at = NOW(), deleted_at = NULL;

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_makeup, 'Nail Care', NULL, 'makeup-nails', 1, 50, NOW(), NOW()
WHERE @cat_makeup IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), is_active = VALUES(is_active), sort_order = VALUES(sort_order), updated_at = NOW(), deleted_at = NULL;

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_makeup, 'Makeup Tools', NULL, 'makeup-tools', 1, 60, NOW(), NOW()
WHERE @cat_makeup IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), is_active = VALUES(is_active), sort_order = VALUES(sort_order), updated_at = NOW(), deleted_at = NULL;

SET @cat_face := (SELECT id FROM categories WHERE slug = 'makeup-face' LIMIT 1);
SET @cat_eye := (SELECT id FROM categories WHERE slug = 'makeup-eye' LIMIT 1);
SET @cat_lip := (SELECT id FROM categories WHERE slug = 'makeup-lip' LIMIT 1);
SET @cat_skin := (SELECT id FROM categories WHERE slug = 'makeup-skincare' LIMIT 1);
SET @cat_nails := (SELECT id FROM categories WHERE slug = 'makeup-nails' LIMIT 1);
SET @cat_tools := (SELECT id FROM categories WHERE slug = 'makeup-tools' LIMIT 1);

-- 3) Leaf subcategories (your list)
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_face, 'Foundation', 'face-foundation', 1, 10, NOW(), NOW() WHERE @cat_face IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_face, 'Concealer', 'face-concealer', 1, 20, NOW(), NOW() WHERE @cat_face IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_face, 'Powder', 'face-powder', 1, 30, NOW(), NOW() WHERE @cat_face IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_face, 'Blush', 'face-blush', 1, 40, NOW(), NOW() WHERE @cat_face IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_face, 'Highlighter', 'face-highlighter', 1, 50, NOW(), NOW() WHERE @cat_face IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;

INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_eye, 'Mascara', 'eye-mascara', 1, 10, NOW(), NOW() WHERE @cat_eye IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_eye, 'Eyeliner', 'eye-eyeliner', 1, 20, NOW(), NOW() WHERE @cat_eye IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_eye, 'Eye Pencil', 'eye-pencil', 1, 30, NOW(), NOW() WHERE @cat_eye IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_eye, 'Eyeshadow', 'eye-eyeshadow', 1, 40, NOW(), NOW() WHERE @cat_eye IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;

INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_lip, 'Lipstick', 'lip-lipstick', 1, 10, NOW(), NOW() WHERE @cat_lip IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_lip, 'Lip Gloss', 'lip-gloss', 1, 20, NOW(), NOW() WHERE @cat_lip IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_lip, 'Moisturizing Lip Cream', 'lip-moisturizing-cream', 1, 30, NOW(), NOW() WHERE @cat_lip IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;

INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_skin, 'Serum', 'skincare-serum', 1, 10, NOW(), NOW() WHERE @cat_skin IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_skin, 'Sunscreen', 'skincare-sunscreen', 1, 20, NOW(), NOW() WHERE @cat_skin IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;

INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_nails, 'Nail Polish', 'nail-polish', 1, 10, NOW(), NOW() WHERE @cat_nails IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_nails, 'Nail Care', 'nail-care', 1, 20, NOW(), NOW() WHERE @cat_nails IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_nails, 'Nail Polish Remover', 'nail-polish-remover', 1, 30, NOW(), NOW() WHERE @cat_nails IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_nails, 'Nail File', 'nail-file', 1, 40, NOW(), NOW() WHERE @cat_nails IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;

INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_tools, 'Makeup Brushes', 'tools-makeup-brushes', 1, 10, NOW(), NOW() WHERE @cat_tools IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_tools, 'Makeup Tools', 'tools-makeup-tools', 1, 20, NOW(), NOW() WHERE @cat_tools IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_tools, 'Makeup Sponge', 'tools-makeup-sponge', 1, 30, NOW(), NOW() WHERE @cat_tools IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @cat_tools, 'Makeup Bag', 'tools-makeup-bag', 1, 40, NOW(), NOW() WHERE @cat_tools IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name), updated_at = NOW(), deleted_at = NULL;

-- 4) Basic makeup attributes
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
VALUES ('shade', 'Shade', 'select', NULL, NOW(), NOW(), NULL)
ON DUPLICATE KEY UPDATE deleted_at = NULL, updated_at = NOW();
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
VALUES ('finish', 'Finish', 'select', NULL, NOW(), NOW(), NULL)
ON DUPLICATE KEY UPDATE deleted_at = NULL, updated_at = NOW();
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
VALUES ('skin_type', 'Skin Type', 'select', NULL, NOW(), NOW(), NULL)
ON DUPLICATE KEY UPDATE deleted_at = NULL, updated_at = NOW();
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
VALUES ('waterproof', 'Waterproof', 'boolean', NULL, NOW(), NOW(), NULL)
ON DUPLICATE KEY UPDATE deleted_at = NULL, updated_at = NOW();
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
VALUES ('volume_ml', 'Volume', 'number', 'ml', NOW(), NOW(), NULL)
ON DUPLICATE KEY UPDATE deleted_at = NULL, updated_at = NOW();
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
VALUES ('spf', 'SPF', 'number', NULL, NOW(), NOW(), NULL)
ON DUPLICATE KEY UPDATE deleted_at = NULL, updated_at = NOW();
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
VALUES ('tool_material', 'Tool Material', 'text', NULL, NOW(), NOW(), NULL)
ON DUPLICATE KEY UPDATE deleted_at = NULL, updated_at = NOW();
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at, deleted_at)
VALUES ('pack_size', 'Pack Size', 'text', NULL, NOW(), NOW(), NULL)
ON DUPLICATE KEY UPDATE deleted_at = NULL, updated_at = NOW();

SET @attr_shade := (SELECT id FROM attributes WHERE code = 'shade' LIMIT 1);
SET @attr_finish := (SELECT id FROM attributes WHERE code = 'finish' LIMIT 1);
SET @attr_skin := (SELECT id FROM attributes WHERE code = 'skin_type' LIMIT 1);
SET @attr_waterproof := (SELECT id FROM attributes WHERE code = 'waterproof' LIMIT 1);
SET @attr_volume := (SELECT id FROM attributes WHERE code = 'volume_ml' LIMIT 1);
SET @attr_spf := (SELECT id FROM attributes WHERE code = 'spf' LIMIT 1);
SET @attr_material := (SELECT id FROM attributes WHERE code = 'tool_material' LIMIT 1);
SET @attr_pack := (SELECT id FROM attributes WHERE code = 'pack_size' LIMIT 1);

INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_shade, 'Ivory', 10 WHERE @attr_shade IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_shade AND value = 'Ivory');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_shade, 'Beige', 20 WHERE @attr_shade IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_shade AND value = 'Beige');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_shade, 'Rose', 30 WHERE @attr_shade IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_shade AND value = 'Rose');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_shade, 'Brown', 40 WHERE @attr_shade IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_shade AND value = 'Brown');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_shade, 'Black', 50 WHERE @attr_shade IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_shade AND value = 'Black');

INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_finish, 'Matte', 10 WHERE @attr_finish IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_finish AND value = 'Matte');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_finish, 'Natural', 20 WHERE @attr_finish IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_finish AND value = 'Natural');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_finish, 'Glossy', 30 WHERE @attr_finish IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_finish AND value = 'Glossy');

INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_skin, 'All', 10 WHERE @attr_skin IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_skin AND value = 'All');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_skin, 'Oily', 20 WHERE @attr_skin IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_skin AND value = 'Oily');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_skin, 'Dry', 30 WHERE @attr_skin IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_skin AND value = 'Dry');
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT @attr_skin, 'Combination', 40 WHERE @attr_skin IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM attribute_options WHERE attribute_id = @attr_skin AND value = 'Combination');

-- 5) Attribute templates on leaf categories
INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_shade, 1, 10
FROM categories c
WHERE c.slug IN (
  'face-foundation','face-concealer','face-powder','face-blush','face-highlighter',
  'eye-mascara','eye-eyeliner','eye-pencil','eye-eyeshadow',
  'lip-lipstick','lip-gloss','nail-polish'
)
AND @attr_shade IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM category_attributes ca
  WHERE ca.category_id = c.id AND ca.attribute_id = @attr_shade
);

INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_finish, 0, 20
FROM categories c
WHERE c.slug IN (
  'face-foundation','face-concealer','face-powder','face-blush','face-highlighter',
  'eye-mascara','eye-eyeliner','eye-pencil','eye-eyeshadow',
  'lip-lipstick','lip-gloss','nail-polish'
)
AND @attr_finish IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM category_attributes ca
  WHERE ca.category_id = c.id AND ca.attribute_id = @attr_finish
);

INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_waterproof, 0, 30
FROM categories c
WHERE c.slug IN ('eye-mascara','eye-eyeliner','eye-pencil','lip-lipstick')
AND @attr_waterproof IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM category_attributes ca
  WHERE ca.category_id = c.id AND ca.attribute_id = @attr_waterproof
);

INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_skin, 1, 10
FROM categories c
WHERE c.slug IN ('skincare-serum','skincare-sunscreen','lip-moisturizing-cream')
AND @attr_skin IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM category_attributes ca
  WHERE ca.category_id = c.id AND ca.attribute_id = @attr_skin
);

INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_volume, 1, 20
FROM categories c
WHERE c.slug IN ('skincare-serum','skincare-sunscreen','lip-moisturizing-cream','nail-care','nail-polish-remover')
AND @attr_volume IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM category_attributes ca
  WHERE ca.category_id = c.id AND ca.attribute_id = @attr_volume
);

INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_volume, 0, 40
FROM categories c
WHERE c.slug IN ('face-foundation','face-concealer','nail-polish')
AND @attr_volume IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM category_attributes ca
  WHERE ca.category_id = c.id AND ca.attribute_id = @attr_volume
);

INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_spf, 1, 30
FROM categories c
WHERE c.slug IN ('skincare-sunscreen')
AND @attr_spf IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM category_attributes ca
  WHERE ca.category_id = c.id AND ca.attribute_id = @attr_spf
);

INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_material, 0, 10
FROM categories c
WHERE c.slug IN ('tools-makeup-brushes','tools-makeup-tools','tools-makeup-sponge','tools-makeup-bag','nail-file')
AND @attr_material IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM category_attributes ca
  WHERE ca.category_id = c.id AND ca.attribute_id = @attr_material
);

INSERT INTO category_attributes (category_id, attribute_id, is_required, sort_order)
SELECT c.id, @attr_pack, 0, 20
FROM categories c
WHERE c.slug IN ('tools-makeup-brushes','tools-makeup-tools','tools-makeup-sponge','tools-makeup-bag','nail-file')
AND @attr_pack IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM category_attributes ca
  WHERE ca.category_id = c.id AND ca.attribute_id = @attr_pack
);
