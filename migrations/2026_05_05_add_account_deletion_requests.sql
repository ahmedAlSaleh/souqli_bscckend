-- Account deletion requests
-- Run: mysql -u root souqli < migrations/2026_05_05_add_account_deletion_requests.sql

CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id bigint PRIMARY KEY AUTO_INCREMENT,
  full_name varchar(120) NOT NULL,
  email varchar(190) NULL,
  phone varchar(30) NULL,
  reason text NOT NULL,
  source varchar(80) NOT NULL DEFAULT 'play_store_form',
  status enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  processed_at datetime NULL,
  created_at datetime NULL,
  updated_at datetime NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_status_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'account_deletion_requests'
    AND index_name = 'idx_account_deletion_status'
);
SET @idx_status_sql := IF(
  @idx_status_exists = 0,
  'CREATE INDEX idx_account_deletion_status ON account_deletion_requests(status)',
  'SELECT 1'
);
PREPARE stmt_idx_status FROM @idx_status_sql;
EXECUTE stmt_idx_status;
DEALLOCATE PREPARE stmt_idx_status;

SET @idx_email_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'account_deletion_requests'
    AND index_name = 'idx_account_deletion_email'
);
SET @idx_email_sql := IF(
  @idx_email_exists = 0,
  'CREATE INDEX idx_account_deletion_email ON account_deletion_requests(email)',
  'SELECT 1'
);
PREPARE stmt_idx_email FROM @idx_email_sql;
EXECUTE stmt_idx_email;
DEALLOCATE PREPARE stmt_idx_email;

SET @idx_phone_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'account_deletion_requests'
    AND index_name = 'idx_account_deletion_phone'
);
SET @idx_phone_sql := IF(
  @idx_phone_exists = 0,
  'CREATE INDEX idx_account_deletion_phone ON account_deletion_requests(phone)',
  'SELECT 1'
);
PREPARE stmt_idx_phone FROM @idx_phone_sql;
EXECUTE stmt_idx_phone;
DEALLOCATE PREPARE stmt_idx_phone;

SET @idx_created_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'account_deletion_requests'
    AND index_name = 'idx_account_deletion_created_at'
);
SET @idx_created_sql := IF(
  @idx_created_exists = 0,
  'CREATE INDEX idx_account_deletion_created_at ON account_deletion_requests(created_at)',
  'SELECT 1'
);
PREPARE stmt_idx_created FROM @idx_created_sql;
EXECUTE stmt_idx_created;
DEALLOCATE PREPARE stmt_idx_created;
