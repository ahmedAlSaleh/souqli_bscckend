-- Product reviews and cart item options
-- Run: mysql -u root souqli < migrations/2026_03_02_add_reviews_and_cart_options.sql

ALTER TABLE cart_items
  ADD COLUMN options_signature varchar(255) NULL AFTER variant_id;

CREATE TABLE IF NOT EXISTS cart_item_options (
  id bigint PRIMARY KEY AUTO_INCREMENT,
  cart_item_id bigint NOT NULL,
  attribute_id bigint NOT NULL,
  option_id bigint NOT NULL,
  created_at datetime,
  CONSTRAINT cart_item_options_item_fk FOREIGN KEY (cart_item_id) REFERENCES cart_items(id) ON DELETE CASCADE,
  CONSTRAINT cart_item_options_attribute_fk FOREIGN KEY (attribute_id) REFERENCES attributes(id),
  CONSTRAINT cart_item_options_option_fk FOREIGN KEY (option_id) REFERENCES attribute_options(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_cart_item_options_item ON cart_item_options(cart_item_id);
CREATE INDEX idx_cart_item_options_option ON cart_item_options(option_id);

CREATE TABLE IF NOT EXISTS order_item_options (
  id bigint PRIMARY KEY AUTO_INCREMENT,
  order_item_id bigint NOT NULL,
  attribute_id bigint NOT NULL,
  option_id bigint NOT NULL,
  created_at datetime,
  CONSTRAINT order_item_options_item_fk FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  CONSTRAINT order_item_options_attribute_fk FOREIGN KEY (attribute_id) REFERENCES attributes(id),
  CONSTRAINT order_item_options_option_fk FOREIGN KEY (option_id) REFERENCES attribute_options(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_order_item_options_item ON order_item_options(order_item_id);

CREATE TABLE IF NOT EXISTS product_reviews (
  id bigint PRIMARY KEY AUTO_INCREMENT,
  product_id bigint NOT NULL,
  user_id bigint NOT NULL,
  rating tinyint NOT NULL,
  comment text,
  created_at datetime,
  updated_at datetime,
  deleted_at datetime,
  CONSTRAINT product_reviews_product_fk FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT product_reviews_user_fk FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_product_reviews_product ON product_reviews(product_id);
