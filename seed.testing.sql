USE souqli;

-- Order statuses
INSERT INTO order_statuses (code, name) VALUES
('PENDING','Pending'),
('ACCEPTED','Accepted'),
('REJECTED','Rejected'),
('PROCESSING','Processing'),
('COMPLETED','Completed'),
('CANCELED','Canceled')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Roles and permissions
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

-- Users
INSERT INTO users (full_name, email, phone, password_hash, is_active, created_at, updated_at) VALUES
('Admin User', 'admin@souqli.com', '0500000001', '$2b$10$XJpSVH7xmMm2cKdOAKuMOuqlTV.ZpCCoI4YdkMaxOlpDkcbVTYyN.', 1, NOW(), NOW()),
('Test User', 'user1@souqli.com', '0500000002', '$2b$10$NftUbKik9tnn1QUEUb2Gouwd/x.J34YDQUhtjK.AmaHWUkqNBjm2S', 1, NOW(), NOW()),
('Demo User', 'user2@souqli.com', '0500000003', '$2b$10$NftUbKik9tnn1QUEUb2Gouwd/x.J34YDQUhtjK.AmaHWUkqNBjm2S', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  phone = VALUES(phone),
  password_hash = VALUES(password_hash),
  is_active = VALUES(is_active),
  updated_at = NOW();

INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'ADMIN'
WHERE u.email = 'admin@souqli.com';

-- Categories (main + subcategories)
INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at) VALUES
(NULL, 'Electronics', 'https://images.unsplash.com/photo-1518770660439-4636190af475', 'electronics', 1, 1, NOW(), NOW()),
(NULL, 'Fashion', 'https://images.unsplash.com/photo-1483985988355-763728e1935b', 'fashion', 1, 2, NOW(), NOW()),
(NULL, 'Beauty', 'https://images.unsplash.com/photo-1500835556837-99ac94a94552', 'beauty', 1, 3, NOW(), NOW()),
(NULL, 'Home', 'https://images.unsplash.com/photo-1484101403633-562f891dc89a', 'home', 1, 4, NOW(), NOW()),
(NULL, 'Sports', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', 'sports', 1, 5, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  image_url = VALUES(image_url),
  is_active = VALUES(is_active),
  sort_order = VALUES(sort_order),
  updated_at = NOW();

SET @electronics_id = (SELECT id FROM categories WHERE slug = 'electronics' LIMIT 1);
SET @fashion_id = (SELECT id FROM categories WHERE slug = 'fashion' LIMIT 1);
SET @beauty_id = (SELECT id FROM categories WHERE slug = 'beauty' LIMIT 1);
SET @home_id = (SELECT id FROM categories WHERE slug = 'home' LIMIT 1);
SET @sports_id = (SELECT id FROM categories WHERE slug = 'sports' LIMIT 1);

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @electronics_id, 'Phones', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', 'phones', 1, 1, NOW(), NOW()
WHERE @electronics_id IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), image_url = VALUES(image_url), updated_at = NOW();

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @electronics_id, 'Audio', 'https://images.unsplash.com/photo-1518443895914-47ed6a7f8d05', 'audio', 1, 2, NOW(), NOW()
WHERE @electronics_id IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), image_url = VALUES(image_url), updated_at = NOW();

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @electronics_id, 'Accessories', 'https://images.unsplash.com/photo-1484704849700-f032a568e944', 'accessories', 1, 3, NOW(), NOW()
WHERE @electronics_id IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), image_url = VALUES(image_url), updated_at = NOW();

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @fashion_id, 'Men', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 'men', 1, 1, NOW(), NOW()
WHERE @fashion_id IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), image_url = VALUES(image_url), updated_at = NOW();

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @fashion_id, 'Women', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1', 'women', 1, 2, NOW(), NOW()
WHERE @fashion_id IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), image_url = VALUES(image_url), updated_at = NOW();

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @fashion_id, 'Bags', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa', 'bags', 1, 3, NOW(), NOW()
WHERE @fashion_id IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), image_url = VALUES(image_url), updated_at = NOW();

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @beauty_id, 'Skincare', 'https://images.unsplash.com/photo-1500835556837-99ac94a94552', 'skincare', 1, 1, NOW(), NOW()
WHERE @beauty_id IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), image_url = VALUES(image_url), updated_at = NOW();

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @home_id, 'Decor', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511', 'decor', 1, 1, NOW(), NOW()
WHERE @home_id IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), image_url = VALUES(image_url), updated_at = NOW();

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @sports_id, 'Shoes', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', 'shoes', 1, 1, NOW(), NOW()
WHERE @sports_id IS NOT NULL
ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), image_url = VALUES(image_url), updated_at = NOW();

SET @phones_id = (SELECT id FROM categories WHERE slug = 'phones' LIMIT 1);
SET @audio_id = (SELECT id FROM categories WHERE slug = 'audio' LIMIT 1);
SET @accessories_id = (SELECT id FROM categories WHERE slug = 'accessories' LIMIT 1);
SET @men_id = (SELECT id FROM categories WHERE slug = 'men' LIMIT 1);
SET @women_id = (SELECT id FROM categories WHERE slug = 'women' LIMIT 1);
SET @bags_id = (SELECT id FROM categories WHERE slug = 'bags' LIMIT 1);
SET @skincare_id = (SELECT id FROM categories WHERE slug = 'skincare' LIMIT 1);
SET @decor_id = (SELECT id FROM categories WHERE slug = 'decor' LIMIT 1);
SET @shoes_id = (SELECT id FROM categories WHERE slug = 'shoes' LIMIT 1);

-- Products
INSERT INTO products (
  category_id, name, slug, description, base_price, currency, sku, is_active,
  is_new, is_deal, deal_price, deal_start_at, deal_end_at, is_popular, sort_order,
  created_at, updated_at
) VALUES
(@phones_id, 'Souqli Pro Earbuds', 'souqli-pro-earbuds', 'Wireless earbuds with noise isolation. Long-lasting battery, premium sound, and fast charging in a compact design.', 120.00, 'SYP', 'SOU-EAR-001', 1, 1, 1, 60.00, NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY), 1, 10, NOW(), NOW()),
(@audio_id, 'Souqli Gaming Headset', 'souqli-gaming-headset', 'High fidelity gaming headset with deep bass and clear microphone.', 150.00, 'SYP', 'SOU-HDP-002', 1, 0, 1, 45.00, NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY), 1, 9, NOW(), NOW()),
(@accessories_id, 'Souqli Smart Watch', 'souqli-smart-watch', 'Smart watch with health tracking, sleep monitoring, and sport modes.', 200.00, 'SYP', 'SOU-WCH-003', 1, 1, 1, 80.00, NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY), 1, 8, NOW(), NOW()),
(@phones_id, 'Phone Case Slim', 'phone-case-slim', 'Slim protective phone case with soft touch.', 12.00, 'SYP', 'SOU-CS-004', 1, 1, 0, NULL, NULL, NULL, 0, 7, NOW(), NOW()),
(@bags_id, 'Classic Leather Bag', 'classic-leather-bag', 'Elegant leather bag for daily use with premium stitching and spacious interior.', 95.00, 'SYP', 'SOU-BAG-005', 1, 0, 0, NULL, NULL, NULL, 1, 6, NOW(), NOW()),
(@shoes_id, 'Running Shoes Pro', 'running-shoes-pro', 'Lightweight running shoes with breathable mesh and soft sole.', 110.00, 'SYP', 'SOU-SHO-006', 1, 1, 1, 55.00, NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY), 0, 5, NOW(), NOW()),
(@skincare_id, 'Vitamin C Serum', 'vitamin-c-serum', 'Brightening skincare serum with gentle formula.', 45.00, 'SYP', 'SOU-BEA-007', 1, 1, 0, NULL, NULL, NULL, 0, 4, NOW(), NOW()),
(@decor_id, 'Minimal Desk Lamp', 'minimal-desk-lamp', 'Warm light desk lamp with metal base and modern design.', 52.00, 'SYP', 'SOU-HOM-008', 1, 0, 0, NULL, NULL, NULL, 1, 3, NOW(), NOW()),
(@audio_id, 'Bluetooth Speaker', 'bluetooth-speaker', 'Portable speaker with deep bass and long battery life.', 80.00, 'SYP', 'SOU-AUD-009', 1, 1, 1, 32.00, NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY), 0, 2, NOW(), NOW()),
(@men_id, 'Everyday Linen Shirt', 'everyday-linen-shirt', 'Lightweight linen shirt for daily wear with a relaxed fit.', 39.00, 'SYP', 'SOU-LIN-010', 1, 0, 0, NULL, NULL, NULL, 1, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id),
  name = VALUES(name),
  description = VALUES(description),
  base_price = VALUES(base_price),
  currency = VALUES(currency),
  sku = VALUES(sku),
  is_active = VALUES(is_active),
  is_new = VALUES(is_new),
  is_deal = VALUES(is_deal),
  deal_price = VALUES(deal_price),
  deal_start_at = VALUES(deal_start_at),
  deal_end_at = VALUES(deal_end_at),
  is_popular = VALUES(is_popular),
  sort_order = VALUES(sort_order),
  updated_at = NOW();

-- Product images (reset for demo slugs)
DELETE pi FROM product_images pi
JOIN products p ON p.id = pi.product_id
WHERE p.slug IN (
  'souqli-pro-earbuds','souqli-gaming-headset','souqli-smart-watch','phone-case-slim',
  'classic-leather-bag','running-shoes-pro','vitamin-c-serum','minimal-desk-lamp',
  'bluetooth-speaker','everyday-linen-shirt'
);

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1518443895914-47ed6a7f8d05', 'Earbuds', 1, 0, NOW()
FROM products p WHERE p.slug = 'souqli-pro-earbuds';

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1484704849700-f032a568e944', 'Earbuds 2', 0, 1, NOW()
FROM products p WHERE p.slug = 'souqli-pro-earbuds';

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1518443895914-47ed6a7f8d05', 'Headset', 1, 0, NOW()
FROM products p WHERE p.slug = 'souqli-gaming-headset';

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', 'Smart Watch', 1, 0, NOW()
FROM products p WHERE p.slug = 'souqli-smart-watch';

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1484704849700-f032a568e944', 'Phone Case', 1, 0, NOW()
FROM products p WHERE p.slug = 'phone-case-slim';

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa', 'Leather Bag', 1, 0, NOW()
FROM products p WHERE p.slug = 'classic-leather-bag';

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 'Leather Bag 2', 0, 1, NOW()
FROM products p WHERE p.slug = 'classic-leather-bag';

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', 'Running Shoes', 1, 0, NOW()
FROM products p WHERE p.slug = 'running-shoes-pro';

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1500835556837-99ac94a94552', 'Serum', 1, 0, NOW()
FROM products p WHERE p.slug = 'vitamin-c-serum';

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4', 'Lamp', 1, 0, NOW()
FROM products p WHERE p.slug = 'minimal-desk-lamp';

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1512446816042-444d64126786', 'Speaker', 1, 0, NOW()
FROM products p WHERE p.slug = 'bluetooth-speaker';

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 'Linen Shirt', 1, 0, NOW()
FROM products p WHERE p.slug = 'everyday-linen-shirt';

-- Product stock
INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT p.id, 50, 2, NOW() FROM products p WHERE p.slug = 'souqli-pro-earbuds'
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity), updated_at = NOW();

INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT p.id, 40, 0, NOW() FROM products p WHERE p.slug = 'souqli-gaming-headset'
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity), updated_at = NOW();

INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT p.id, 35, 3, NOW() FROM products p WHERE p.slug = 'souqli-smart-watch'
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity), updated_at = NOW();

INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT p.id, 200, 5, NOW() FROM products p WHERE p.slug = 'phone-case-slim'
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity), updated_at = NOW();

INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT p.id, 25, 1, NOW() FROM products p WHERE p.slug = 'classic-leather-bag'
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity), updated_at = NOW();

INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT p.id, 60, 2, NOW() FROM products p WHERE p.slug = 'running-shoes-pro'
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity), updated_at = NOW();

INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT p.id, 80, 0, NOW() FROM products p WHERE p.slug = 'vitamin-c-serum'
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity), updated_at = NOW();

INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT p.id, 30, 0, NOW() FROM products p WHERE p.slug = 'minimal-desk-lamp'
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity), updated_at = NOW();

INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT p.id, 90, 4, NOW() FROM products p WHERE p.slug = 'bluetooth-speaker'
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity), updated_at = NOW();

INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT p.id, 70, 0, NOW() FROM products p WHERE p.slug = 'everyday-linen-shirt'
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity), updated_at = NOW();

-- Home banners
INSERT INTO home_banners (id, title, subtitle, image_url, button_text, button_link, sort_order, is_active, created_at, updated_at) VALUES
(1, 'IPHONE', 'UP to 80% OFF', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', 'Shop', NULL, 1, 1, NOW(), NOW()),
(2, 'New Arrivals', 'Fresh styles for today', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 'Explore', NULL, 2, 1, NOW(), NOW()),
(3, 'Big Deals', 'Limited time offers', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', 'Shop', NULL, 3, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  subtitle = VALUES(subtitle),
  image_url = VALUES(image_url),
  button_text = VALUES(button_text),
  button_link = VALUES(button_link),
  sort_order = VALUES(sort_order),
  is_active = VALUES(is_active),
  updated_at = NOW();

-- Stores
INSERT INTO stores (name, logo_url, whatsapp, address, city, owner_user_id, created_at, updated_at)
SELECT 'Souqli Main Store', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', '+201000000000', 'Main street 1', 'Riyadh', u.id, NOW(), NOW()
FROM users u
WHERE u.email = 'admin@souqli.com'
  AND NOT EXISTS (SELECT 1 FROM stores s WHERE s.name = 'Souqli Main Store');

INSERT INTO stores (name, logo_url, whatsapp, address, city, owner_user_id, created_at, updated_at)
SELECT 'Souqli East', 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c', '+201000000111', 'East district', 'Riyadh', u.id, NOW(), NOW()
FROM users u
WHERE u.email = 'admin@souqli.com'
  AND NOT EXISTS (SELECT 1 FROM stores s WHERE s.name = 'Souqli East');

SET @store1_id = (SELECT id FROM stores WHERE name = 'Souqli Main Store' LIMIT 1);
SET @store2_id = (SELECT id FROM stores WHERE name = 'Souqli East' LIMIT 1);

DELETE FROM store_phones WHERE store_id IN (@store1_id, @store2_id);
INSERT INTO store_phones (store_id, phone, label, is_primary, created_at, updated_at)
SELECT @store1_id, '+201000000000', 'Main', 1, NOW(), NOW()
WHERE @store1_id IS NOT NULL;

INSERT INTO store_phones (store_id, phone, label, is_primary, created_at, updated_at)
SELECT @store2_id, '+201000000111', 'East', 1, NOW(), NOW()
WHERE @store2_id IS NOT NULL;

-- Store hours (09:00-22:00)
INSERT INTO store_hours (store_id, day_of_week, open_time, close_time, is_closed, created_at, updated_at, deleted_at)
VALUES
(@store1_id, 0, '09:00:00', '22:00:00', 0, NOW(), NOW(), NULL),
(@store1_id, 1, '09:00:00', '22:00:00', 0, NOW(), NOW(), NULL),
(@store1_id, 2, '09:00:00', '22:00:00', 0, NOW(), NOW(), NULL),
(@store1_id, 3, '09:00:00', '22:00:00', 0, NOW(), NOW(), NULL),
(@store1_id, 4, '09:00:00', '22:00:00', 0, NOW(), NOW(), NULL),
(@store1_id, 5, '09:00:00', '22:00:00', 0, NOW(), NOW(), NULL),
(@store1_id, 6, '09:00:00', '22:00:00', 0, NOW(), NOW(), NULL),
(@store2_id, 0, '10:00:00', '21:00:00', 0, NOW(), NOW(), NULL),
(@store2_id, 1, '10:00:00', '21:00:00', 0, NOW(), NOW(), NULL),
(@store2_id, 2, '10:00:00', '21:00:00', 0, NOW(), NOW(), NULL),
(@store2_id, 3, '10:00:00', '21:00:00', 0, NOW(), NOW(), NULL),
(@store2_id, 4, '10:00:00', '21:00:00', 0, NOW(), NOW(), NULL),
(@store2_id, 5, '10:00:00', '21:00:00', 0, NOW(), NOW(), NULL),
(@store2_id, 6, '10:00:00', '21:00:00', 0, NOW(), NOW(), NULL)
ON DUPLICATE KEY UPDATE
  open_time = VALUES(open_time),
  close_time = VALUES(close_time),
  is_closed = VALUES(is_closed),
  updated_at = NOW(),
  deleted_at = NULL;

-- Store availability for demo products
INSERT INTO store_products (store_id, product_id, stock, price_override, is_available, created_at, updated_at, deleted_at)
SELECT @store1_id, p.id, 20, NULL, 1, NOW(), NOW(), NULL
FROM products p
WHERE p.slug IN (
  'souqli-pro-earbuds','souqli-gaming-headset','souqli-smart-watch','phone-case-slim',
  'classic-leather-bag','running-shoes-pro','vitamin-c-serum','minimal-desk-lamp',
  'bluetooth-speaker','everyday-linen-shirt'
)
ON DUPLICATE KEY UPDATE
  stock = VALUES(stock),
  price_override = VALUES(price_override),
  is_available = VALUES(is_available),
  updated_at = NOW(),
  deleted_at = NULL;

INSERT INTO store_products (store_id, product_id, stock, price_override, is_available, created_at, updated_at, deleted_at)
SELECT @store2_id, p.id, 10, p.base_price - 5, 1, NOW(), NOW(), NULL
FROM products p
WHERE p.slug IN ('souqli-pro-earbuds','classic-leather-bag','running-shoes-pro')
ON DUPLICATE KEY UPDATE
  stock = VALUES(stock),
  price_override = VALUES(price_override),
  is_available = VALUES(is_available),
  updated_at = NOW(),
  deleted_at = NULL;

-- Attributes
INSERT INTO attributes (code, name, data_type, unit, created_at, updated_at) VALUES
('color','Color','select',NULL,NOW(),NOW()),
('size','Size','select',NULL,NOW(),NOW()),
('material','Material','text',NULL,NOW(),NOW()),
('features','Features','text',NULL,NOW(),NOW()),
('status','Status','text',NULL,NOW(),NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name), data_type = VALUES(data_type), unit = VALUES(unit), updated_at = NOW();

DELETE FROM product_attribute_values
WHERE option_id IN (
  SELECT id FROM attribute_options
  WHERE attribute_id IN (SELECT id FROM attributes WHERE code IN ('color','size','material'))
);

DELETE FROM attribute_options
WHERE attribute_id IN (SELECT id FROM attributes WHERE code IN ('color','size','material'));

INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT a.id, 'Black', 1 FROM attributes a WHERE a.code = 'color';
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT a.id, 'White', 2 FROM attributes a WHERE a.code = 'color';
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT a.id, 'Gold', 3 FROM attributes a WHERE a.code = 'color';
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT a.id, 'Brown', 4 FROM attributes a WHERE a.code = 'color';
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT a.id, 'S', 1 FROM attributes a WHERE a.code = 'size';
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT a.id, 'M', 2 FROM attributes a WHERE a.code = 'size';
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT a.id, 'L', 3 FROM attributes a WHERE a.code = 'size';
INSERT INTO attribute_options (attribute_id, value, sort_order)
SELECT a.id, 'XL', 4 FROM attributes a WHERE a.code = 'size';

DELETE FROM category_attributes
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('phones','shoes','bags'))
  AND attribute_id IN (SELECT id FROM attributes WHERE code IN ('color','size'));

INSERT IGNORE INTO category_attributes (category_id, attribute_id, is_required)
SELECT c.id, a.id, 1
FROM categories c
JOIN attributes a ON a.code IN ('color','size')
WHERE c.slug IN ('phones','shoes','bags');

DELETE pav FROM product_attribute_values pav
JOIN products p ON p.id = pav.product_id
JOIN attributes a ON a.id = pav.attribute_id
WHERE p.slug IN ('souqli-pro-earbuds','classic-leather-bag')
  AND a.code IN ('color','size','features','status');

-- Attribute values for a demo product
INSERT INTO product_attribute_values (product_id, attribute_id, option_id, created_at, updated_at)
SELECT p.id, a.id, ao.id, NOW(), NOW()
FROM products p
JOIN attributes a ON a.code = 'color'
JOIN attribute_options ao ON ao.attribute_id = a.id AND ao.value = 'Black'
WHERE p.slug = 'souqli-pro-earbuds';

INSERT INTO product_attribute_values (product_id, attribute_id, option_id, created_at, updated_at)
SELECT p.id, a.id, ao.id, NOW(), NOW()
FROM products p
JOIN attributes a ON a.code = 'size'
JOIN attribute_options ao ON ao.attribute_id = a.id AND ao.value = 'M'
WHERE p.slug = 'souqli-pro-earbuds';

INSERT INTO product_attribute_values (product_id, attribute_id, value_text, created_at, updated_at)
SELECT p.id, a.id, '3-month warranty, fast charger, wireless headphones', NOW(), NOW()
FROM products p
JOIN attributes a ON a.code = 'features'
WHERE p.slug = 'souqli-pro-earbuds';

INSERT INTO product_attribute_values (product_id, attribute_id, value_text, created_at, updated_at)
SELECT p.id, a.id, 'In excellent condition.', NOW(), NOW()
FROM products p
JOIN attributes a ON a.code = 'status'
WHERE p.slug = 'souqli-pro-earbuds';

INSERT INTO product_attribute_values (product_id, attribute_id, option_id, created_at, updated_at)
SELECT p.id, a.id, ao.id, NOW(), NOW()
FROM products p
JOIN attributes a ON a.code = 'color'
JOIN attribute_options ao ON ao.attribute_id = a.id AND ao.value = 'Brown'
WHERE p.slug = 'classic-leather-bag';

INSERT INTO product_attribute_values (product_id, attribute_id, option_id, created_at, updated_at)
SELECT p.id, a.id, ao.id, NOW(), NOW()
FROM products p
JOIN attributes a ON a.code = 'size'
JOIN attribute_options ao ON ao.attribute_id = a.id AND ao.value = 'L'
WHERE p.slug = 'classic-leather-bag';

INSERT INTO product_attribute_values (product_id, attribute_id, value_text, created_at, updated_at)
SELECT p.id, a.id, 'Safe, gentle, clean scent, light longevity, classic design.', NOW(), NOW()
FROM products p
JOIN attributes a ON a.code = 'features'
WHERE p.slug = 'classic-leather-bag';

-- Favorites for demo user
SET @user1_id = (SELECT id FROM users WHERE email = 'user1@souqli.com' LIMIT 1);
INSERT IGNORE INTO favorites (user_id, product_id, created_at, updated_at)
SELECT @user1_id, p.id, NOW(), NOW()
FROM products p
WHERE p.slug IN ('souqli-pro-earbuds','classic-leather-bag','running-shoes-pro');

-- Pages
INSERT INTO pages (`key`, title, content, updated_at) VALUES
('privacy_policy', 'Privacy Policy', 'Your privacy matters. This is a demo policy.', NOW()),
('terms', 'Terms & Conditions', 'These are demo terms for Souqli.', NOW()),
('about', 'About Souqli', 'Souqli is a marketplace demo.', NOW())
ON DUPLICATE KEY UPDATE title = VALUES(title), content = VALUES(content), updated_at = NOW();

-- User addresses
SET @user1_id = (SELECT id FROM users WHERE email = 'user1@souqli.com' LIMIT 1);
SET @user2_id = (SELECT id FROM users WHERE email = 'user2@souqli.com' LIMIT 1);
DELETE FROM user_addresses WHERE user_id IN (@user1_id, @user2_id);
INSERT INTO user_addresses (user_id, label, country, city, street, postal_code, notes, is_default, created_at, updated_at) VALUES
(@user1_id, 'Home', 'Syria', 'Damascus', 'Al Hamra Street 12', '0100', 'Main address', 1, NOW(), NOW()),
(@user1_id, 'Office', 'Syria', 'Damascus', 'Mazza Street 4', '0101', 'Work address', 0, NOW(), NOW()),
(@user2_id, 'Home', 'Syria', 'Homs', 'Al Wadi Street 3', '0200', 'Primary address', 1, NOW(), NOW());

-- Product reviews
SET @review_p1 = (SELECT id FROM products WHERE slug = 'souqli-pro-earbuds' LIMIT 1);
SET @review_p2 = (SELECT id FROM products WHERE slug = 'classic-leather-bag' LIMIT 1);
SET @review_p3 = (SELECT id FROM products WHERE slug = 'running-shoes-pro' LIMIT 1);
DELETE FROM product_reviews WHERE product_id IN (@review_p1, @review_p2, @review_p3) AND user_id IN (@user1_id, @user2_id);
INSERT INTO product_reviews (product_id, user_id, rating, comment, created_at, updated_at) VALUES
(@review_p1, @user1_id, 5, 'Great sound and battery life.', NOW(), NOW()),
(@review_p1, @user2_id, 4, 'Comfortable and clear audio.', NOW(), NOW()),
(@review_p2, @user1_id, 5, 'Excellent quality and finish.', NOW(), NOW()),
(@review_p3, @user2_id, 3, 'Good but size runs small.', NOW(), NOW());
