INSERT INTO permissions (code, description, created_at, updated_at) VALUES
('manage_users','Manage users and RBAC',NOW(),NOW()),
('manage_orders','Manage orders',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  updated_at = NOW();

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('manage_users','manage_orders')
WHERE r.name = 'ADMIN';
