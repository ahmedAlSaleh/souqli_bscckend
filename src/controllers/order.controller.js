const OrderService = require('../services/order.service');
const { parsePagination, buildPagination } = require('../utils/pagination');
const { ok, fail } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    const result = await OrderService.createFromCart(req.user.id, req.body);
    return ok(res, 'Order created', result, 201);
  } catch (err) {
    if (err.status) return fail(res, err.message, null, err.status);
    next(err);
  }
};

const myOrders = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { orders, total } = await OrderService.listMyOrders(req.user.id, { limit, offset });
    return ok(res, 'My orders', { items: orders, pagination: buildPagination(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, myOrders };
