const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/admin/home-banner.controller');
const auth = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const PERM = require('../utils/permissions');

const router = express.Router();

router.use(auth, requirePermission(PERM.MANAGE_HOME));

router.get('/', controller.list);
router.get('/:id', [param('id').isInt()], validate, controller.getById);

router.post(
  '/',
  [
    body('title').trim().notEmpty(),
    body('subtitle').optional().isString(),
    body('image_url').trim().notEmpty(),
    body('button_text').optional().isString(),
    body('button_link').optional().isString(),
    body('sort_order').optional().isInt(),
    body('is_active').optional().isBoolean()
  ],
  validate,
  controller.create
);

router.patch(
  '/:id',
  [
    param('id').isInt(),
    body('title').optional().trim().notEmpty(),
    body('subtitle').optional().isString(),
    body('image_url').optional().isString(),
    body('button_text').optional().isString(),
    body('button_link').optional().isString(),
    body('sort_order').optional().isInt(),
    body('is_active').optional().isBoolean()
  ],
  validate,
  controller.update
);

router.delete('/:id', [param('id').isInt()], validate, controller.remove);

module.exports = router;
