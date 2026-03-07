const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/admin/rbac.controller');
const auth = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const PERM = require('../utils/permissions');

const router = express.Router();

router.use(auth, requirePermission(PERM.MANAGE_USERS));

router.get('/roles', controller.listRoles);
router.post(
  '/roles',
  [body('name').trim().notEmpty(), body('description').optional({ nullable: true }).isString()],
  validate,
  controller.createRole
);
router.patch(
  '/roles/:roleId',
  [
    param('roleId').isInt(),
    body('name').optional().trim().notEmpty(),
    body('description').optional({ nullable: true }).isString()
  ],
  validate,
  controller.updateRole
);
router.delete('/roles/:roleId', [param('roleId').isInt()], validate, controller.deleteRole);
router.get('/roles/:roleId/permissions', [param('roleId').isInt()], validate, controller.listRolePermissions);
router.put(
  '/roles/:roleId/permissions',
  [param('roleId').isInt(), body('permission_ids').isArray(), body('permission_ids.*').optional().isInt({ min: 1 })],
  validate,
  controller.setRolePermissions
);

router.get('/permissions', controller.listPermissions);
router.post(
  '/permissions',
  [body('code').trim().notEmpty(), body('description').optional({ nullable: true }).isString()],
  validate,
  controller.createPermission
);
router.patch(
  '/permissions/:permissionId',
  [
    param('permissionId').isInt(),
    body('code').optional().trim().notEmpty(),
    body('description').optional({ nullable: true }).isString()
  ],
  validate,
  controller.updatePermission
);
router.delete(
  '/permissions/:permissionId',
  [param('permissionId').isInt()],
  validate,
  controller.deletePermission
);

module.exports = router;
