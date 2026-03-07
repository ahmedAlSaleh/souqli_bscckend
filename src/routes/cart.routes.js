const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/cart.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

router.use(auth);

router.get('/', controller.getCart);

router.post(
  '/items',
  [
    body('product_id').isInt(),
    body('variant_id').optional().isInt(),
    body('quantity').isInt({ min: 1 }),
    body('options').optional().isArray(),
    body('options.*.attribute_id').optional().isInt(),
    body('options.*.option_id').optional().isInt()
  ],
  validate,
  controller.addItem
);

router.patch(
  '/items/:id',
  [param('id').isInt(), body('quantity').isInt({ min: 1 })],
  validate,
  controller.updateItem
);

router.delete('/items/:id', [param('id').isInt()], validate, controller.removeItem);

module.exports = router;
