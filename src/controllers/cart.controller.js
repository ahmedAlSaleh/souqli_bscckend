const CartService = require('../services/cart.service');
const { ok, fail } = require('../utils/response');

const getCart = async (req, res, next) => {
  try {
    const data = await CartService.getCart(req.user.id);
    return ok(res, 'Cart', data);
  } catch (err) {
    next(err);
  }
};

const addItem = async (req, res, next) => {
  try {
    const result = await CartService.addItem(req.user.id, req.body);
    return ok(res, 'Item added to cart', result, 201);
  } catch (err) {
    if (err.status) return fail(res, err.message, null, err.status);
    next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
    await CartService.updateItem(req.user.id, req.params.id, req.body.quantity);
    return ok(res, 'Cart item updated', { id: Number(req.params.id) });
  } catch (err) {
    if (err.status) return fail(res, err.message, null, err.status);
    next(err);
  }
};

const removeItem = async (req, res, next) => {
  try {
    await CartService.removeItem(req.user.id, req.params.id);
    return ok(res, 'Cart item removed', { id: Number(req.params.id) });
  } catch (err) {
    if (err.status) return fail(res, err.message, null, err.status);
    next(err);
  }
};

module.exports = { getCart, addItem, updateItem, removeItem };
