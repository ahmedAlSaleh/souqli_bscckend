const PaymentModel = require('../../models/payment.model');
const OrderModel = require('../../models/order.model');
const ActivityService = require('../../services/activity.service');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const { ok, fail } = require('../../utils/response');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const search = req.query.search ? String(req.query.search).trim() : '';
    const status = req.query.status ? String(req.query.status).trim() : '';
    const orderId = req.query.order_id ? Number(req.query.order_id) : null;

    const [items, total] = await Promise.all([
      PaymentModel.listPaginated({ limit, offset, search, status, orderId }),
      PaymentModel.countAll({ search, status, orderId })
    ]);

    return ok(res, 'Payments', { items, pagination: buildPagination(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const item = await PaymentModel.findById(req.params.id);
    if (!item) return fail(res, 'Payment not found', null, 404);
    return ok(res, 'Payment', item);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const order = await OrderModel.findAdminById(req.body.order_id);
    if (!order) return fail(res, 'Order not found', null, 404);

    const id = await PaymentModel.create(req.body);

    await ActivityService.log(req.user.id, 'CREATE_PAYMENT', 'payments', id, {
      order_id: req.body.order_id,
      amount: req.body.amount
    });

    return ok(res, 'Payment created', { id }, 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    if (req.body.order_id !== undefined) {
      const order = await OrderModel.findAdminById(req.body.order_id);
      if (!order) return fail(res, 'Order not found', null, 404);
    }

    const affected = await PaymentModel.update(req.params.id, req.body);
    if (!affected) return fail(res, 'Payment not found or no changes', null, 404);

    await ActivityService.log(req.user.id, 'UPDATE_PAYMENT', 'payments', req.params.id, req.body);

    return ok(res, 'Payment updated', { id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const affected = await PaymentModel.remove(req.params.id);
    if (!affected) return fail(res, 'Payment not found', null, 404);

    await ActivityService.log(req.user.id, 'DELETE_PAYMENT', 'payments', req.params.id, null);

    return ok(res, 'Payment deleted', { id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove
};
