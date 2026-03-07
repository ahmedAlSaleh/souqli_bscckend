USE souqli;

SET @db := DATABASE();

SET @has_store_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db
    AND TABLE_NAME = 'order_items'
    AND COLUMN_NAME = 'store_id'
);

SET @sql := IF(
  @has_store_col = 0,
  'ALTER TABLE `order_items` ADD COLUMN `store_id` bigint NULL AFTER `variant_id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_store_idx := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db
    AND TABLE_NAME = 'order_items'
    AND INDEX_NAME = 'order_items_index_53'
);

SET @sql := IF(
  @has_store_idx = 0,
  'CREATE INDEX `order_items_index_53` ON `order_items` (`store_id`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_store_fk := (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = @db
    AND TABLE_NAME = 'order_items'
    AND CONSTRAINT_NAME = 'order_items_fk_store_id'
);

SET @sql := IF(
  @has_store_fk = 0,
  'ALTER TABLE `order_items` ADD CONSTRAINT `order_items_fk_store_id` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
