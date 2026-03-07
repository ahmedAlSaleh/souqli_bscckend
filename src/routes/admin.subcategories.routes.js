const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/admin/subcategory.controller');
const auth = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const PERM = require('../utils/permissions');

const router = express.Router();

router.use(auth);

router.get('/', requirePermission(PERM.MANAGE_CATEGORIES), controller.list);

router.get(
  '/:id/attributes',
  [param('id').isInt()],
  validate,
  requirePermission(PERM.MANAGE_ATTRIBUTES),
  controller.listAttributes
);

router.post(
  '/:id/attributes',
  [
    param('id').isInt(),
    body('attribute_id').isInt(),
    body('is_required').optional().isBoolean(),
    body('sort_order').optional().isInt()
  ],
  validate,
  requirePermission(PERM.MANAGE_ATTRIBUTES),
  controller.attachAttribute
);

router.patch(
  '/:id/attributes/:mapId',
  [
    param('id').isInt(),
    param('mapId').isInt(),
    body('is_required').optional().isBoolean(),
    body('sort_order').optional().isInt()
  ],
  validate,
  requirePermission(PERM.MANAGE_ATTRIBUTES),
  controller.updateAttribute
);

router.delete(
  '/:id/attributes/:mapId',
  [param('id').isInt(), param('mapId').isInt()],
  validate,
  requirePermission(PERM.MANAGE_ATTRIBUTES),
  controller.removeAttribute
);

module.exports = router;
