const FavoriteModel = require('../../models/favorite.model');
const ProductModel = require('../../models/product.model');
const { ok, fail } = require('../../utils/response');

const listFavorites = async (req, res, next) => {
  try {
    const items = await FavoriteModel.listByUser(req.user.id);
    return ok(res, 'Favorites', { items });
  } catch (err) {
    next(err);
  }
};

const addFavorite = async (req, res, next) => {
  try {
    const { product_id } = req.body;
    if (!product_id) {
      return fail(res, 'Product is required', null, 400);
    }

    const product = await ProductModel.findById(product_id);
    if (!product) {
      return fail(res, 'Product not found', null, 404);
    }

    await FavoriteModel.add(req.user.id, product_id);
    return ok(res, 'Added to favorites', { product_id });
  } catch (err) {
    next(err);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    if (!productId) {
      return fail(res, 'Product is required', null, 400);
    }
    await FavoriteModel.remove(req.user.id, productId);
    return ok(res, 'Removed from favorites', { product_id: productId });
  } catch (err) {
    next(err);
  }
};

const listFavoriteIds = async (req, res, next) => {
  try {
    const items = await FavoriteModel.listIdsByUser(req.user.id);
    return ok(res, 'Favorite IDs', { items });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listFavorites,
  addFavorite,
  removeFavorite,
  listFavoriteIds
};
