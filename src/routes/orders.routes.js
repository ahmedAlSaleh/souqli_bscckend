const express = require('express');
const { body, query } = require('express-validator');
const controller = require('../controllers/order.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

router.use(auth);

router.post(
  '/',
  [body('address_id').optional().isInt(), body('notes').optional().isString()],
  validate,
  controller.create
);

router.get(
  '/my',
  [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 })],
  validate,
  controller.myOrders
);

module.exports = router;
