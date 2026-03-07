const ReviewModel = require('../../models/review.model');
const ProductModel = require('../../models/product.model');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const { ok, fail } = require('../../utils/response');

const listByProduct = async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    if (!productId) return fail(res, 'Invalid product', null, 400);

    const { page, limit, offset } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      ReviewModel.listByProduct({ productId, limit, offset }),
      ReviewModel.countByProduct(productId)
    ]);

    return ok(res, 'Reviews', { items, pagination: buildPagination(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    if (!productId) return fail(res, 'Invalid product', null, 400);

    const product = await ProductModel.findById(productId);
    if (!product || product.deleted_at || !product.is_active) {
      return fail(res, 'Product not found', null, 404);
    }

    const rating = Number(req.body.rating || 0);
    if (rating < 1 || rating > 5) {
      return fail(res, 'Rating must be between 1 and 5', null, 400);
    }

    const id = await ReviewModel.create(req.user.id, productId, {
      rating,
      comment: req.body.comment
    });
    return ok(res, 'Review created', { id }, 201);
  } catch (err) {
    next(err);
  }
};

module.exports = { listByProduct, create };
