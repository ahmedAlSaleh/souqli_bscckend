-- Stores and product availability per store
-- Run this before 2026_02_24_link_order_items_stores.sql

CREATE TABLE IF NOT EXISTS stores (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(190) NOT NULL,
  logo_url VARCHAR(500) NULL,
  whatsapp VARCHAR(30) NULL,
  address VARCHAR(255) NULL,
  city VARCHAR(80) NULL,
  owner_user_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  INDEX idx_stores_owner_user_id (owner_user_id),
  INDEX idx_stores_city (city),
  INDEX idx_stores_deleted_at (deleted_at),
  CONSTRAINT stores_fk_owner_user_id FOREIGN KEY (owner_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS store_phones (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  store_id BIGINT NOT NULL,
  phone VARCHAR(40) NOT NULL,
  label VARCHAR(60) NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  INDEX idx_store_phones_store_id (store_id),
  INDEX idx_store_phones_deleted_at (deleted_at),
  CONSTRAINT store_phones_fk_store_id FOREIGN KEY (store_id) REFERENCES stores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS store_hours (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  store_id BIGINT NOT NULL,
  day_of_week TINYINT NOT NULL,
  open_time TIME NULL,
  close_time TIME NULL,
  is_closed TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uq_store_hours_store_day (store_id, day_of_week),
  INDEX idx_store_hours_deleted_at (deleted_at),
  CONSTRAINT store_hours_fk_store_id FOREIGN KEY (store_id) REFERENCES stores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS store_products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  store_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  price_override DECIMAL(10,2) NULL,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uq_store_products_store_product (store_id, product_id),
  INDEX idx_store_products_product_id (product_id),
  INDEX idx_store_products_deleted_at (deleted_at),
  CONSTRAINT store_products_fk_store_id FOREIGN KEY (store_id) REFERENCES stores(id),
  CONSTRAINT store_products_fk_product_id FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
