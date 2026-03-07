const CartModel = require('../../models/cart.model');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const { ok, fail } = require('../../utils/response');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const search = req.query.search ? String(req.query.search).trim() : '';
    const status = req.query.status ? String(req.query.status).trim() : '';

    const [items, total] = await Promise.all([
      CartModel.listAdmin({ limit, offset, search, status }),
      CartModel.countAdmin({ search, status })
    ]);

    return ok(res, 'Carts', { items, pagination: buildPagination(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const cart = await CartModel.findByIdAdmin(req.params.id);
    if (!cart) return fail(res, 'Cart not found', null, 404);

    const items = await CartModel.getItemsByCartIdAdmin(req.params.id);
    return ok(res, 'Cart', { ...cart, items });
  } catch (err) {
    next(err);
  }
};

const listItems = async (req, res, next) => {
  try {
    const cart = await CartModel.findByIdAdmin(req.params.id);
    if (!cart) return fail(res, 'Cart not found', null, 404);

    const items = await CartModel.getItemsByCartIdAdmin(req.params.id);
    return ok(res, 'Cart items', { items });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  getById,
  listItems
};
