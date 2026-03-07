CREATE TABLE IF NOT EXISTS home_banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  subtitle VARCHAR(200) NULL,
  image_url VARCHAR(500) NOT NULL,
  button_text VARCHAR(50) NULL,
  button_link VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  INDEX idx_home_banners_active (is_active, deleted_at, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE products
  ADD COLUMN is_new TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN is_deal TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN deal_price DECIMAL(10,2) NULL,
  ADD COLUMN deal_start_at DATETIME NULL,
  ADD COLUMN deal_end_at DATETIME NULL,
  ADD COLUMN is_popular TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN sort_order INT NOT NULL DEFAULT 0;

CREATE INDEX idx_products_new ON products (is_new, is_active, deleted_at, sort_order);
CREATE INDEX idx_products_deal ON products (is_deal, is_active, deleted_at, deal_start_at, deal_end_at, sort_order);
CREATE INDEX idx_products_popular ON products (is_popular, is_active, deleted_at, sort_order);
