const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/admin/attribute.controller');
const auth = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const PERM = require('../utils/permissions');

const router = express.Router();

router.use(auth, requirePermission(PERM.MANAGE_ATTRIBUTES));

router.get('/', controller.list);
router.get('/:id', [param('id').isInt()], validate, controller.getById);

router.post(
  '/',
  [
    body('code').trim().notEmpty(),
    body('name').trim().notEmpty(),
    body('data_type').trim().notEmpty(),
    body('unit').optional().isString()
  ],
  validate,
  controller.create
);

router.patch(
  '/:id',
  [
    param('id').isInt(),
    body('code').optional().trim().notEmpty(),
    body('name').optional().trim().notEmpty(),
    body('data_type').optional().trim().notEmpty(),
    body('unit').optional().isString()
  ],
  validate,
  controller.update
);

router.delete('/:id', [param('id').isInt()], validate, controller.remove);

router.get('/:id/options', [param('id').isInt()], validate, controller.listOptions);

router.post(
  '/:id/options',
  [param('id').isInt(), body('value').trim().notEmpty(), body('sort_order').optional().isInt()],
  validate,
  controller.createOption
);

router.patch(
  '/options/:optionId',
  [
    param('optionId').isInt(),
    body('value').optional().trim().notEmpty(),
    body('sort_order').optional().isInt()
  ],
  validate,
  controller.updateOption
);

router.delete('/options/:optionId', [param('optionId').isInt()], validate, controller.deleteOption);

module.exports = router;
