const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/admin/store.controller');
const auth = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const PERM = require('../utils/permissions');

const router = express.Router();

router.use(auth, requirePermission(PERM.MANAGE_STORES));

router.get('/', controller.list);
router.get('/:id', [param('id').isInt()], validate, controller.getById);

router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('logo_url').optional().isString(),
    body('whatsapp').optional().isString(),
    body('address').optional().isString(),
    body('city').optional().isString()
  ],
  validate,
  controller.create
);

router.patch(
  '/:id',
  [
    param('id').isInt(),
    body('name').optional().trim().notEmpty(),
    body('logo_url').optional().isString(),
    body('whatsapp').optional().isString(),
    body('address').optional().isString(),
    body('city').optional().isString()
  ],
  validate,
  controller.update
);

router.delete('/:id', [param('id').isInt()], validate, controller.remove);

router.get('/:id/phones', [param('id').isInt()], validate, controller.listPhones);
router.post(
  '/:id/phones',
  [
    param('id').isInt(),
    body('phone').trim().notEmpty(),
    body('label').optional().isString(),
    body('is_primary').optional().isBoolean()
  ],
  validate,
  controller.createPhone
);
router.patch(
  '/:id/phones/:phoneId',
  [
    param('id').isInt(),
    param('phoneId').isInt(),
    body('phone').optional().trim().notEmpty(),
    body('label').optional().isString(),
    body('is_primary').optional().isBoolean()
  ],
  validate,
  controller.updatePhone
);
router.delete(
  '/:id/phones/:phoneId',
  [param('id').isInt(), param('phoneId').isInt()],
  validate,
  controller.deletePhone
);

router.get('/:id/hours', [param('id').isInt()], validate, controller.listHours);
router.put(
  '/:id/hours',
  [
    param('id').isInt(),
    body('hours').isArray({ min: 1 }),
    body('hours.*.day_of_week').isInt({ min: 0, max: 6 }),
    body('hours.*.open_time').optional().isString(),
    body('hours.*.close_time').optional().isString(),
    body('hours.*.is_closed').optional().isBoolean()
  ],
  validate,
  controller.upsertHours
);

router.get('/:id/products', [param('id').isInt()], validate, controller.listStoreProducts);
router.post(
  '/:id/products',
  [
    param('id').isInt(),
    body('product_id').isInt(),
    body('stock').optional().isInt({ min: 0 }),
    body('price_override').optional().isFloat({ min: 0 }),
    body('is_available').optional().isBoolean()
  ],
  validate,
  controller.attachStoreProduct
);
router.patch(
  '/:id/products/:mapId',
  [
    param('id').isInt(),
    param('mapId').isInt(),
    body('stock').optional().isInt({ min: 0 }),
    body('price_override').optional().isFloat({ min: 0 }),
    body('is_available').optional().isBoolean()
  ],
  validate,
  controller.updateStoreProduct
);
router.delete(
  '/:id/products/:mapId',
  [param('id').isInt(), param('mapId').isInt()],
  validate,
  controller.deleteStoreProduct
);

module.exports = router;
