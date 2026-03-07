const express = require('express');
const { body, param, query } = require('express-validator');
const controller = require('../controllers/admin/payment.controller');
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
    query('status').optional().isString(),
    query('order_id').optional().isInt({ min: 1 })
  ],
  validate,
  controller.list
);

router.get('/:id', [param('id').isInt()], validate, controller.getById);

router.post(
  '/',
  [
    body('order_id').isInt({ min: 1 }),
    body('payment_method').optional({ nullable: true }).isString(),
    body('transaction_id').optional({ nullable: true }).isString(),
    body('amount').isFloat({ min: 0 }),
    body('currency').optional({ nullable: true }).isString(),
    body('status').optional({ nullable: true }).isString()
  ],
  validate,
  controller.create
);

router.patch(
  '/:id',
  [
    param('id').isInt(),
    body('order_id').optional().isInt({ min: 1 }),
    body('payment_method').optional({ nullable: true }).isString(),
    body('transaction_id').optional({ nullable: true }).isString(),
    body('amount').optional().isFloat({ min: 0 }),
    body('currency').optional({ nullable: true }).isString(),
    body('status').optional({ nullable: true }).isString()
  ],
  validate,
  controller.update
);

router.delete('/:id', [param('id').isInt()], validate, controller.remove);

module.exports = router;
