-- Needed by src/models/category-attribute.model.js

SET @db := DATABASE();

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
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_idx := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db
    AND TABLE_NAME = 'category_attributes'
    AND INDEX_NAME = 'idx_category_attributes_sort'
);

SET @sql := IF(
  @has_idx = 0,
  'CREATE INDEX idx_category_attributes_sort ON category_attributes (category_id, sort_order)',
  'SELECT 1'
);
PREPARE stmt2 FROM @sql;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
