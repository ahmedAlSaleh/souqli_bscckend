const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimit');

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  [
    body('full_name').trim().isLength({ min: 2 }).withMessage('Full name is required'),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isLength({ min: 6 }),
    body().custom((value, { req }) => {
      if (!req.body.email && !req.body.phone) {
        throw new Error('Email or phone is required');
      }
      return true;
    }),
    body('password').isLength({ min: 6 })
  ],
  validate,
  AuthController.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isLength({ min: 6 }),
    body('identifier').optional().isLength({ min: 3 }),
    body().custom((value, { req }) => {
      if (!req.body.email && !req.body.phone && !req.body.identifier) {
        throw new Error('Email or phone is required');
      }
      return true;
    }),
    body('password').isLength({ min: 6 })
  ],
  validate,
  AuthController.login
);

router.get('/me', auth, AuthController.me);
router.patch(
  '/me',
  auth,
  [
    body('full_name').optional().trim().isLength({ min: 2 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isLength({ min: 6 }),
    body('password').optional().isLength({ min: 6 }),
    body().custom((value, { req }) => {
      if (!req.body.full_name && !req.body.email && !req.body.phone && !req.body.password) {
        throw new Error('No data to update');
      }
      return true;
    })
  ],
  validate,
  AuthController.updateMe
);
router.put(
  '/me',
  auth,
  [
    body('full_name').optional().trim().isLength({ min: 2 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isLength({ min: 6 }),
    body('password').optional().isLength({ min: 6 }),
    body().custom((value, { req }) => {
      if (!req.body.full_name && !req.body.email && !req.body.phone && !req.body.password) {
        throw new Error('No data to update');
      }
      return true;
    })
  ],
  validate,
  AuthController.updateMe
);

module.exports = router;
