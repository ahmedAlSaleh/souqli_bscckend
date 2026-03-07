const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/admin/product.controller');
const auth = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const PERM = require('../utils/permissions');

const router = express.Router();

router.use(auth, requirePermission(PERM.MANAGE_PRODUCTS));

router.get('/', controller.list);

router.get('/:id/stores', [param('id').isInt()], validate, controller.listStores);
router.get('/:id/variants', [param('id').isInt()], validate, controller.listVariants);

router.post(
  '/:id/variants',
  [
    param('id').isInt(),
    body('sku').optional().isString(),
    body('price').optional().isFloat({ min: 0 }),
    body('stock').optional().isInt({ min: 0 }),
    body('is_active').optional().isBoolean()
  ],
  validate,
  controller.createVariant
);

router.patch(
  '/:id/variants/:variantId',
  [
    param('id').isInt(),
    param('variantId').isInt(),
    body('sku').optional().isString(),
    body('price').optional().isFloat({ min: 0 }),
    body('stock').optional().isInt({ min: 0 }),
    body('is_active').optional().isBoolean()
  ],
  validate,
  controller.updateVariant
);

router.delete(
  '/:id/variants/:variantId',
  [param('id').isInt(), param('variantId').isInt()],
  validate,
  controller.deleteVariant
);

router.get('/:id', [param('id').isInt()], validate, controller.getById);

router.post(
  '/',
  [
    body('category_id').isInt(),
    body('name').trim().notEmpty(),
    body('slug').trim().notEmpty(),
    body('description').optional().isString(),
    body('base_price').optional().isFloat({ min: 0 }),
    body('currency').optional().isString(),
    body('sku').optional().isString(),
    body('is_active').optional().isBoolean(),
    body('is_new').optional().isBoolean(),
    body('is_deal').optional().isBoolean(),
    body('deal_price').optional().isFloat({ min: 0 }),
    body('deal_start_at').optional().isString(),
    body('deal_end_at').optional().isString(),
    body('is_popular').optional().isBoolean(),
    body('sort_order').optional().isInt(),
    body('attributes').optional().isArray(),
    body('attributes.*.attribute_id').optional().isInt(),
    body('attributes.*.option_id').optional().isInt(),
    body('attributes.*.value_text').optional().isString(),
    body('attributes.*.value_number').optional().isFloat(),
    body('attributes.*.value_boolean').optional().isBoolean(),
    body('attributes.*.value_date').optional().isString(),
    body('stock').optional().isObject(),
    body('stock.quantity').optional().isInt({ min: 0 }),
    body('stock.reserved_quantity').optional().isInt({ min: 0 }),
    body('stores').optional().isArray(),
    body('stores.*.store_id').optional().isInt(),
    body('stores.*.stock').optional().isInt({ min: 0 }),
    body('stores.*.price_override').optional().isFloat({ min: 0 }),
    body('stores.*.is_available').optional().isBoolean(),
    body('images').optional().isArray(),
    body('images.*.url').optional().isString().notEmpty(),
    body('images.*.alt').optional().isString(),
    body('images.*.is_primary').optional().isBoolean(),
    body('images.*.sort_order').optional().isInt()
  ],
  validate,
  controller.create
);

router.patch(
  '/:id',
  [
    param('id').isInt(),
    body('category_id').optional().isInt(),
    body('name').optional().trim().notEmpty(),
    body('slug').optional().trim().notEmpty(),
    body('description').optional().isString(),
    body('base_price').optional().isFloat({ min: 0 }),
    body('currency').optional().isString(),
    body('sku').optional().isString(),
    body('is_active').optional().isBoolean(),
    body('is_new').optional().isBoolean(),
    body('is_deal').optional().isBoolean(),
    body('deal_price').optional().isFloat({ min: 0 }),
    body('deal_start_at').optional().isString(),
    body('deal_end_at').optional().isString(),
    body('is_popular').optional().isBoolean(),
    body('sort_order').optional().isInt(),
    body('attributes').optional().isArray(),
    body('attributes.*.attribute_id').optional().isInt(),
    body('attributes.*.option_id').optional().isInt(),
    body('attributes.*.value_text').optional().isString(),
    body('attributes.*.value_number').optional().isFloat(),
    body('attributes.*.value_boolean').optional().isBoolean(),
    body('attributes.*.value_date').optional().isString(),
    body('stock').optional().isObject(),
    body('stock.quantity').optional().isInt({ min: 0 }),
    body('stock.reserved_quantity').optional().isInt({ min: 0 }),
    body('stores').optional().isArray(),
    body('stores.*.store_id').optional().isInt(),
    body('stores.*.stock').optional().isInt({ min: 0 }),
    body('stores.*.price_override').optional().isFloat({ min: 0 }),
    body('stores.*.is_available').optional().isBoolean(),
    body('images').optional().isArray(),
    body('images.*.url').optional().isString().notEmpty(),
    body('images.*.alt').optional().isString(),
    body('images.*.is_primary').optional().isBoolean(),
    body('images.*.sort_order').optional().isInt()
  ],
  validate,
  controller.update
);

router.delete('/:id', [param('id').isInt()], validate, controller.remove);

module.exports = router;
