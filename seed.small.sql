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

-- Roles and permissions (minimal admin access)
INSERT INTO roles (name, description, created_at, updated_at)
VALUES ('ADMIN','Full access',NOW(),NOW())
ON DUPLICATE KEY UPDATE description = VALUES(description), updated_at = NOW();

INSERT INTO permissions (code, description, created_at, updated_at) VALUES
('manage_categories','Manage categories',NOW(),NOW()),
('manage_products','Manage products',NOW(),NOW()),
('manage_stores','Manage stores',NOW(),NOW()),
('manage_orders','Manage orders',NOW(),NOW()),
('manage_home','Manage home content',NOW(),NOW())
ON DUPLICATE KEY UPDATE description = VALUES(description), updated_at = NOW();

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'manage_categories',
  'manage_products',
  'manage_stores',
  'manage_orders',
  'manage_home'
)
WHERE r.name = 'ADMIN';

-- Users (2-3 demo accounts)
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

-- Assign ADMIN role to admin@souqli.com
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'ADMIN'
WHERE u.email = 'admin@souqli.com';

-- Categories (main + subcategories)
INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at) VALUES
(NULL, 'Electronics', 'https://images.unsplash.com/photo-1518770660439-4636190af475', 'electronics', 1, 1, NOW(), NOW()),
(NULL, 'Fashion', 'https://images.unsplash.com/photo-1483985988355-763728e1935b', 'fashion', 1, 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  image_url = VALUES(image_url),
  is_active = VALUES(is_active),
  sort_order = VALUES(sort_order),
  updated_at = NOW();

SET @electronics_id = (SELECT id FROM categories WHERE slug = 'electronics' LIMIT 1);
SET @fashion_id = (SELECT id FROM categories WHERE slug = 'fashion' LIMIT 1);

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @electronics_id, 'Phones', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', 'phones', 1, 1, NOW(), NOW()
WHERE @electronics_id IS NOT NULL
ON DUPLICATE KEY UPDATE
  parent_id = VALUES(parent_id),
  name = VALUES(name),
  image_url = VALUES(image_url),
  is_active = VALUES(is_active),
  sort_order = VALUES(sort_order),
  updated_at = NOW();

INSERT INTO categories (parent_id, name, image_url, slug, is_active, sort_order, created_at, updated_at)
SELECT @fashion_id, 'Men', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 'men', 1, 1, NOW(), NOW()
WHERE @fashion_id IS NOT NULL
ON DUPLICATE KEY UPDATE
  parent_id = VALUES(parent_id),
  name = VALUES(name),
  image_url = VALUES(image_url),
  is_active = VALUES(is_active),
  sort_order = VALUES(sort_order),
  updated_at = NOW();

SET @phones_id = (SELECT id FROM categories WHERE slug = 'phones' LIMIT 1);
SET @men_id = (SELECT id FROM categories WHERE slug = 'men' LIMIT 1);

-- Products (3 items total)
INSERT INTO products (
  category_id, name, slug, description, base_price, currency, sku, is_active,
  is_new, is_popular, is_deal, deal_price, deal_start_at, deal_end_at,
  sort_order, created_at, updated_at
) VALUES
(@phones_id, 'Souqli Pro Earbuds', 'souqli-pro-earbuds', 'Wireless earbuds with noise isolation.', 59.00, 'USD', 'SOU-EAR-001', 1, 1, 1, 1, 49.00, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, NOW(), NOW()),
(@phones_id, 'Phone Case Slim', 'phone-case-slim', 'Slim protective phone case.', 12.00, 'USD', 'SOU-CS-002', 1, 1, 0, 0, NULL, NULL, NULL, 2, NOW(), NOW()),
(@men_id, 'Everyday Linen Shirt', 'everyday-linen-shirt', 'Lightweight linen shirt for daily wear.', 39.00, 'USD', 'SOU-LIN-214', 1, 0, 1, 0, NULL, NULL, NULL, 3, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id),
  name = VALUES(name),
  description = VALUES(description),
  base_price = VALUES(base_price),
  currency = VALUES(currency),
  sku = VALUES(sku),
  is_active = VALUES(is_active),
  is_new = VALUES(is_new),
  is_popular = VALUES(is_popular),
  is_deal = VALUES(is_deal),
  deal_price = VALUES(deal_price),
  deal_start_at = VALUES(deal_start_at),
  deal_end_at = VALUES(deal_end_at),
  sort_order = VALUES(sort_order),
  updated_at = NOW();

-- Product images
DELETE FROM product_images WHERE product_id IN (
  SELECT id FROM products WHERE slug IN ('souqli-pro-earbuds','phone-case-slim','everyday-linen-shirt')
);

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1518443895914-47ed6a7f8d05', 'Earbuds', 1, 0, NOW()
FROM products p WHERE p.slug = 'souqli-pro-earbuds';

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1484704849700-f032a568e944', 'Phone Case', 1, 0, NOW()
FROM products p WHERE p.slug = 'phone-case-slim';

INSERT INTO product_images (product_id, url, alt, is_primary, sort_order, created_at)
SELECT p.id, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 'Linen Shirt', 1, 0, NOW()
FROM products p WHERE p.slug = 'everyday-linen-shirt';

-- Product stock
INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT p.id, 30, 2, NOW() FROM products p WHERE p.slug = 'souqli-pro-earbuds'
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity), updated_at = NOW();

INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT p.id, 120, 5, NOW() FROM products p WHERE p.slug = 'phone-case-slim'
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity), updated_at = NOW();

INSERT INTO product_stock (product_id, quantity, reserved_quantity, updated_at)
SELECT p.id, 40, 0, NOW() FROM products p WHERE p.slug = 'everyday-linen-shirt'
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity), updated_at = NOW();

-- Home banners (slides)
INSERT INTO home_banners (id, title, subtitle, image_url, button_text, button_link, sort_order, is_active, created_at, updated_at) VALUES
(1, 'IPHONE', 'UP to 80% OFF', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', 'Shop', NULL, 1, 1, NOW(), NOW()),
(2, 'New Arrivals', 'Fresh styles for today', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 'Explore', NULL, 2, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  subtitle = VALUES(subtitle),
  image_url = VALUES(image_url),
  button_text = VALUES(button_text),
  button_link = VALUES(button_link),
  sort_order = VALUES(sort_order),
  is_active = VALUES(is_active),
  updated_at = NOW();

-- Store (single demo store + availability)
INSERT INTO stores (name, logo_url, whatsapp, address, city, owner_user_id, created_at, updated_at)
SELECT 'Souqli Main Store', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', '+201000000000', 'Main street 1', 'Riyadh', u.id, NOW(), NOW()
FROM users u
WHERE u.email = 'admin@souqli.com'
  AND NOT EXISTS (SELECT 1 FROM stores s WHERE s.name = 'Souqli Main Store');

SET @store_id = (SELECT id FROM stores WHERE name = 'Souqli Main Store' LIMIT 1);

DELETE FROM store_phones WHERE store_id = @store_id;
INSERT INTO store_phones (store_id, phone, label, is_primary, created_at, updated_at)
SELECT @store_id, '+201000000000', 'Main', 1, NOW(), NOW()
WHERE @store_id IS NOT NULL;

-- Store hours (all week 09:00-22:00)
INSERT INTO store_hours (store_id, day_of_week, open_time, close_time, is_closed, created_at, updated_at, deleted_at)
VALUES
(@store_id, 0, '09:00:00', '22:00:00', 0, NOW(), NOW(), NULL),
(@store_id, 1, '09:00:00', '22:00:00', 0, NOW(), NOW(), NULL),
(@store_id, 2, '09:00:00', '22:00:00', 0, NOW(), NOW(), NULL),
(@store_id, 3, '09:00:00', '22:00:00', 0, NOW(), NOW(), NULL),
(@store_id, 4, '09:00:00', '22:00:00', 0, NOW(), NOW(), NULL),
(@store_id, 5, '09:00:00', '22:00:00', 0, NOW(), NOW(), NULL),
(@store_id, 6, '09:00:00', '22:00:00', 0, NOW(), NOW(), NULL)
ON DUPLICATE KEY UPDATE
  open_time = VALUES(open_time),
  close_time = VALUES(close_time),
  is_closed = VALUES(is_closed),
  updated_at = NOW(),
  deleted_at = NULL;

-- Store availability for demo products
INSERT INTO store_products (store_id, product_id, stock, price_override, is_available, created_at, updated_at, deleted_at)
SELECT @store_id, p.id, 20, NULL, 1, NOW(), NOW(), NULL
FROM products p
WHERE p.slug IN ('souqli-pro-earbuds','phone-case-slim','everyday-linen-shirt')
ON DUPLICATE KEY UPDATE
  stock = VALUES(stock),
  price_override = VALUES(price_override),
  is_available = VALUES(is_available),
  updated_at = NOW(),
  deleted_at = NULL;
