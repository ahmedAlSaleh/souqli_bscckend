CREATE TABLE IF NOT EXISTS favorites (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY favorites_user_product_unique (user_id, product_id),
  INDEX favorites_user_idx (user_id),
  INDEX favorites_product_idx (product_id),
  CONSTRAINT favorites_user_fk FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT favorites_product_fk FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
