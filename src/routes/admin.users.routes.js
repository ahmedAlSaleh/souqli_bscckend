const express = require('express');
const { body, param, query } = require('express-validator');
const controller = require('../controllers/admin/user.controller');
const auth = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const PERM = require('../utils/permissions');

const router = express.Router();

router.use(auth, requirePermission(PERM.MANAGE_USERS));

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString()
  ],
  validate,
  controller.list
);

router.get('/:id', [param('id').isInt()], validate, controller.getById);

router.post(
  '/',
  [
    body('full_name').trim().isLength({ min: 2 }),
    body('email').isEmail().normalizeEmail(),
    body('phone').optional({ nullable: true }).isString(),
    body('password').isLength({ min: 6 }),
    body('is_active').optional().isBoolean(),
    body('role_ids').optional().isArray(),
    body('role_ids.*').optional().isInt({ min: 1 })
  ],
  validate,
  controller.create
);

router.patch(
  '/:id',
  [
    param('id').isInt(),
    body('full_name').optional().trim().isLength({ min: 2 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional({ nullable: true }).isString(),
    body('password').optional().isLength({ min: 6 }),
    body('is_active').optional().isBoolean(),
    body('role_ids').optional().isArray(),
    body('role_ids.*').optional().isInt({ min: 1 })
  ],
  validate,
  controller.update
);

router.delete('/:id', [param('id').isInt()], validate, controller.remove);

router.patch(
  '/:id/roles',
  [param('id').isInt(), body('role_ids').isArray(), body('role_ids.*').optional().isInt({ min: 1 })],
  validate,
  controller.setRoles
);

router.get('/:id/addresses', [param('id').isInt()], validate, controller.listAddresses);

router.post(
  '/:id/addresses',
  [
    param('id').isInt(),
    body('label').optional({ nullable: true }).isString(),
    body('country').optional({ nullable: true }).isString(),
    body('city').optional({ nullable: true }).isString(),
    body('street').optional({ nullable: true }).isString(),
    body('postal_code').optional({ nullable: true }).isString(),
    body('notes').optional({ nullable: true }).isString(),
    body('is_default').optional().isBoolean()
  ],
  validate,
  controller.createAddress
);

router.patch(
  '/:id/addresses/:addressId',
  [
    param('id').isInt(),
    param('addressId').isInt(),
    body('label').optional({ nullable: true }).isString(),
    body('country').optional({ nullable: true }).isString(),
    body('city').optional({ nullable: true }).isString(),
    body('street').optional({ nullable: true }).isString(),
    body('postal_code').optional({ nullable: true }).isString(),
    body('notes').optional({ nullable: true }).isString(),
    body('is_default').optional().isBoolean()
  ],
  validate,
  controller.updateAddress
);

router.delete(
  '/:id/addresses/:addressId',
  [param('id').isInt(), param('addressId').isInt()],
  validate,
  controller.deleteAddress
);

module.exports = router;
