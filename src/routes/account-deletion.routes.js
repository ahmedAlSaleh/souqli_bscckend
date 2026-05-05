const express = require('express');
const { body } = require('express-validator');
const AccountDeletionController = require('../controllers/account-deletion.controller');
const validate = require('../middlewares/validate');
const { authLimiter } = require('../middlewares/rateLimit');

const router = express.Router();

router.get('/', AccountDeletionController.renderPage);

router.post(
  '/requests',
  authLimiter,
  [
    body('full_name')
      .trim()
      .isLength({ min: 2, max: 120 })
      .withMessage('Name is required'),
    body('email')
      .optional({ values: 'falsy' })
      .isEmail()
      .withMessage('Invalid email')
      .normalizeEmail(),
    body('phone')
      .optional({ values: 'falsy' })
      .isLength({ min: 6, max: 30 })
      .withMessage('Invalid phone number'),
    body('reason')
      .trim()
      .isLength({ min: 5, max: 1000 })
      .withMessage('Reason is required'),
    body('source')
      .optional({ values: 'falsy' })
      .trim()
      .isLength({ min: 2, max: 80 })
      .withMessage('Invalid source'),
    body().custom((value, { req }) => {
      if (!req.body.email && !req.body.phone) {
        throw new Error('Email or phone is required');
      }
      return true;
    })
  ],
  validate,
  AccountDeletionController.createRequest
);

module.exports = router;
