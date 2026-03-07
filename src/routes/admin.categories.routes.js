const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/admin/category.controller');
const auth = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const PERM = require('../utils/permissions');

const router = express.Router();

router.use(auth, requirePermission(PERM.MANAGE_CATEGORIES));

router.get('/', controller.list);

router.get('/:id', [param('id').isInt()], validate, controller.getById);

router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('slug').trim().notEmpty(),
    body('image_url').optional().isString(),
    body('parent_id').optional().isInt(),
    body('is_active').optional().isBoolean(),
    body('sort_order').optional().isInt()
  ],
  validate,
  controller.create
);

router.patch(
  '/:id',
  [
    param('id').isInt(),
    body('name').optional().trim().notEmpty(),
    body('slug').optional().trim().notEmpty(),
    body('image_url').optional().isString(),
    body('parent_id').optional().isInt(),
    body('is_active').optional().isBoolean(),
    body('sort_order').optional().isInt()
  ],
  validate,
  controller.update
);

router.delete('/:id', [param('id').isInt()], validate, controller.remove);

module.exports = router;
