const express = require('express');
const { param, query, body } = require('express-validator');
const controller = require('../controllers/store/product.controller');
const reviewController = require('../controllers/store/review.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('category_id').optional().isInt(),
    query('q').optional().isString(),
    query('min_price').optional().isFloat({ min: 0 }),
    query('max_price').optional().isFloat({ min: 0 }),
    query('is_new').optional().isBoolean(),
    query('is_popular').optional().isBoolean(),
    query('is_deal').optional().isBoolean(),
    query('sort').optional().isString(),
    query('city').optional().isString()
  ],
  validate,
  controller.list
);

router.get('/:id', [param('id').isInt()], validate, controller.getById);

router.get('/:id/reviews', [param('id').isInt()], validate, reviewController.listByProduct);
router.post(
  '/:id/reviews',
  auth,
  [param('id').isInt(), body('rating').isInt({ min: 1, max: 5 }), body('comment').optional().isString()],
  validate,
  reviewController.create
);

module.exports = router;
