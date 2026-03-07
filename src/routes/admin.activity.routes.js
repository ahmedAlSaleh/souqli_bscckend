const express = require('express');
const { query } = require('express-validator');
const controller = require('../controllers/admin/activity.controller');
const auth = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const PERM = require('../utils/permissions');

const router = express.Router();

router.use(auth, requirePermission(PERM.VIEW_ACTIVITY_LOGS));

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('action').optional().isString(),
    query('entity_type').optional().isString(),
    query('user_id').optional().isInt({ min: 1 }),
    query('date_from').optional().isISO8601(),
    query('date_to').optional().isISO8601()
  ],
  validate,
  controller.list
);

module.exports = router;
