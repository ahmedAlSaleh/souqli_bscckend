const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/address.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

router.use(auth);

router.get('/', controller.listMyAddresses);

router.post(
  '/',
  [
    body('label').optional().isString(),
    body('country').optional().isString(),
    body('city').optional().isString(),
    body('street').optional().isString(),
    body('postal_code').optional().isString(),
    body('notes').optional().isString(),
    body('is_default').optional().isBoolean()
  ],
  validate,
  controller.createMyAddress
);

router.patch(
  '/:id',
  [
    param('id').isInt(),
    body('label').optional().isString(),
    body('country').optional().isString(),
    body('city').optional().isString(),
    body('street').optional().isString(),
    body('postal_code').optional().isString(),
    body('notes').optional().isString(),
    body('is_default').optional().isBoolean()
  ],
  validate,
  controller.updateMyAddress
);

router.delete('/:id', [param('id').isInt()], validate, controller.deleteMyAddress);

module.exports = router;
