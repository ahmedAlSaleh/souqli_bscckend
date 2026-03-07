const express = require('express');
const { param, query } = require('express-validator');
const controller = require('../controllers/admin/cart-admin.controller');
const auth = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const PERM = require('../utils/permissions');

const router = express.Router();

router.use(auth, requirePermission(PERM.MANAGE_ORDERS));

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('status').optional().isString()
  ],
  validate,
  controller.list
);

router.get('/:id', [param('id').isInt()], validate, controller.getById);
router.get('/:id/items', [param('id').isInt()], validate, controller.listItems);

module.exports = router;
