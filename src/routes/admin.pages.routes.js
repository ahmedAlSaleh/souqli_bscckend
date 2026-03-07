const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/admin/page.controller');
const auth = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const PERM = require('../utils/permissions');

const router = express.Router();

router.use(auth, requirePermission(PERM.MANAGE_PAGES));

router.get('/', controller.list);
router.get('/:id', [param('id').isInt()], validate, controller.getById);

router.post(
  '/',
  [body('key').trim().notEmpty(), body('title').trim().notEmpty(), body('content').trim().notEmpty()],
  validate,
  controller.create
);

router.patch(
  '/:id',
  [
    param('id').isInt(),
    body('key').optional().trim().notEmpty(),
    body('title').optional().trim().notEmpty(),
    body('content').optional().trim().notEmpty()
  ],
  validate,
  controller.update
);

router.delete('/:id', [param('id').isInt()], validate, controller.remove);

module.exports = router;
