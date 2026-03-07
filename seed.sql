USE souqli;

-- Order statuses (required for order creation)
INSERT INTO order_statuses (code, name) VALUES
('PENDING','Pending'),
('ACCEPTED','Accepted'),
('REJECTED','Rejected'),
('PROCESSING','Processing'),
('COMPLETED','Completed'),
('CANCELED','Canceled')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Roles and permissions (admin access)
INSERT INTO roles (name, description, created_at, updated_at)
VALUES ('ADMIN','Full access',NOW(),NOW())
ON DUPLICATE KEY UPDATE description = VALUES(description), updated_at = NOW();

INSERT INTO permissions (code, description, created_at, updated_at) VALUES
('manage_categories','Manage categories',NOW(),NOW()),
('manage_products','Manage products',NOW(),NOW()),
('manage_stores','Manage stores',NOW(),NOW()),
('manage_users','Manage users and RBAC',NOW(),NOW()),
('manage_orders','Manage orders',NOW(),NOW()),
('manage_attributes','Manage attributes',NOW(),NOW()),
('manage_pages','Manage pages',NOW(),NOW()),
('view_activity_logs','View activity logs',NOW(),NOW()),
('manage_home','Manage home content',NOW(),NOW())
ON DUPLICATE KEY UPDATE description = VALUES(description), updated_at = NOW();

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'manage_categories',
  'manage_products',
  'manage_stores',
  'manage_users',
  'manage_orders',
  'manage_attributes',
  'manage_pages',
  'view_activity_logs',
  'manage_home'
)
WHERE r.name = 'ADMIN';

-- Demo categories (safe to re-run)
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at) VALUES
(NULL, 'Electronics', 'electronics', 1, 1, NOW(), NOW()),
(NULL, 'Fashion', 'fashion', 1, 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  is_active = VALUES(is_active),
  sort_order = VALUES(sort_order),
  updated_at = NOW();

SET @electronics_id = (SELECT id FROM categories WHERE slug = 'electronics' LIMIT 1);
INSERT INTO categories (parent_id, name, slug, is_active, sort_order, created_at, updated_at)
SELECT @electronics_id, 'Phones', 'phones', 1, 1, NOW(), NOW()
WHERE @electronics_id IS NOT NULL
ON DUPLICATE KEY UPDATE
  parent_id = VALUES(parent_id),
  name = VALUES(name),
  is_active = VALUES(is_active),
  sort_order = VALUES(sort_order),
  updated_at = NOW();

-- Clean existing demo products and related rows
DELETE FROM product_attribute_values WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('souqli-pro-headphones','everyday-linen-shirt','minimal-desk-lamp')
);
DELETE FROM product_images WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('souqli-pro-headphones','everyday-linen-shirt','minimal-desk-lamp')
);
DELETE FROM products WHERE slug IN ('souqli-pro-headphones','everyday-linen-shirt','minimal-desk-lamp');

-- Demo products
INSERT INTO products (category_id, name, slug, description, base_price, currency, sku, is_active, created_at, updated_at) VALUES
((SELECT id FROM categories WHERE slug='phones'), 'Souqli Pro Headphones', 'souqli-pro-headphones', 'Wireless noise-canceling headphones.', 149.00, 'USD', 'SOU-HDP-001', 1, NOW(), NOW()),
((SELECT id FROM categories WHERE slug='fashion'), 'Everyday Linen Shirt', 'everyday-linen-shirt', 'Lightweight linen shirt for daily wear.', 39.00, 'USD', 'SOU-LIN-214', 1, NOW(), NOW()),
((SELECT id FROM categories WHERE slug='electronics'), 'Minimal Desk Lamp', 'minimal-desk-lamp', 'Warm light desk lamp with metal base.', 52.00, 'USD', 'SOU-LMP-812', 1, NOW(), NOW());

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1518443895914-47ed6a7f8d05', 'Headphones', 1, 0, NOW()
FROM products p WHERE p.slug = 'souqli-pro-headphones';

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 'Linen Shirt', 1, 0, NOW()
FROM products p WHERE p.slug = 'everyday-linen-shirt';

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4', 'Desk Lamp', 1, 0, NOW()
FROM products p WHERE p.slug = 'minimal-desk-lamp';

-- Home banners (demo)
INSERT INTO home_banners (title, subtitle, image_url, button_text, button_link, sort_order, is_active, created_at, updated_at)
VALUES
('IPHONE', 'UP to 80% OFF', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', 'Shop', NULL, 1, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE subtitle = VALUES(subtitle), image_url = VALUES(image_url), updated_at = NOW();

-- Mark demo products for home sections
UPDATE products SET is_new = 1, is_popular = 1 WHERE slug = 'souqli-pro-headphones';
UPDATE products SET is_new = 1 WHERE slug = 'everyday-linen-shirt';
UPDATE products
SET is_deal = 1, deal_price = 99.00, deal_start_at = NOW(), deal_end_at = DATE_ADD(NOW(), INTERVAL 7 DAY)
WHERE slug = 'souqli-pro-headphones';

-- Attributes and options
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at) VALUES
('color','Color','select',NULL,NOW(),NOW()),
('storage','Storage','select','GB',NOW(),NOW()),
('material','Material','text',NULL,NOW(),NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name), data_type = VALUES(data_type), unit = VALUES(unit), updated_at = NOW();

DELETE FROM attribute_options
WHERE attribute_id IN (SELECT id FROM attributes WHERE code IN ('color','storage','material'));

INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT a.id, 'Black', 1 FROM attributes a WHERE a.code = 'color';
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT a.id, 'White', 2 FROM attributes a WHERE a.code = 'color';
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT a.id, '128', 1 FROM attributes a WHERE a.code = 'storage';
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT a.id, '256', 2 FROM attributes a WHERE a.code = 'storage';

DELETE FROM category_attributes
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('phones'))
  AND attribute_id IN (SELECT id FROM attributes WHERE code IN ('color','storage'));

INSERT IGNORE INTO category_attributes (category_id, attribute_id, is_required)
SELECT c.id, a.id, 1
FROM categories c
JOIN attributes a ON a.code IN ('color','storage')
WHERE c.slug = 'phones';

-- Attribute values for the demo product
INSERT INTO product_attribute_values (product_id, attribute_id, option_id, created_at, updated_at)
SELECT p.id, a.id, ao.id, NOW(), NOW()
FROM products p
JOIN attributes a ON a.code = 'color'
JOIN attribute_options ao ON ao.attribute_id = a.id AND ao.value = 'Black'
WHERE p.slug = 'souqli-pro-headphones';

INSERT INTO product_attribute_values (product_id, attribute_id, option_id, created_at, updated_at)
SELECT p.id, a.id, ao.id, NOW(), NOW()
FROM products p
JOIN attributes a ON a.code = 'storage'
JOIN attribute_options ao ON ao.attribute_id = a.id AND ao.value = '256'
WHERE p.slug = 'souqli-pro-headphones';

-- Content pages
INSERT INTO pages (`key`, title, content, updated_at) VALUES
('privacy_policy', 'Privacy Policy', 'Your privacy matters. This is a demo policy.', NOW()),
('terms', 'Terms & Conditions', 'These are demo terms for Souqli.', NOW()),
('about', 'About Souqli', 'Souqli is a marketplace dashboard demo.', NOW())
ON DUPLICATE KEY UPDATE title = VALUES(title), content = VALUES(content), updated_at = NOW();
