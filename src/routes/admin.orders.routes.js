const express = require('express');
const { body, param, query } = require('express-validator');
const controller = require('../controllers/admin/order.controller');
const auth = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const PERM = require('../utils/permissions');

const router = express.Router();

router.use(auth, requirePermission(PERM.MANAGE_ORDERS));

router.get('/statuses', controller.listStatuses);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('status_id').optional().isInt({ min: 1 })
  ],
  validate,
  controller.list
);

router.get('/:id', [param('id').isInt()], validate, controller.getById);
router.get(
  '/:id/items/:itemId/stores',
  [param('id').isInt(), param('itemId').isInt()],
  validate,
  controller.listItemStores
);

router.patch(
  '/:id/status',
  [
    param('id').isInt(),
    body('status_id').optional().isInt({ min: 1 }),
    body('status_code').optional().isString()
  ],
  validate,
  controller.updateStatus
);

router.patch(
  '/:id/items/:itemId/store',
  [
    param('id').isInt(),
    param('itemId').isInt(),
    body('store_id').optional({ nullable: true }).isInt({ min: 1 })
  ],
  validate,
  controller.assignItemStore
);

module.exports = router;
