const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const FavoritesController = require('../controllers/store/favorites.controller');

const router = express.Router();

router.get('/', auth, FavoritesController.listFavorites);
router.get('/ids', auth, FavoritesController.listFavoriteIds);

router.post(
  '/',
  auth,
  [body('product_id').isInt({ min: 1 })],
  validate,
  FavoritesController.addFavorite
);

router.delete(
  '/:productId',
  auth,
  [param('productId').isInt({ min: 1 })],
  validate,
  FavoritesController.removeFavorite
);

module.exports = router;
