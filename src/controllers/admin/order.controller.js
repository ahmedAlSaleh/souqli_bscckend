const OrderModel = require('../../models/order.model');
const ActivityService = require('../../services/activity.service');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const { ok, fail } = require('../../utils/response');

const ASSIGNABLE_STATUS_CODES = new Set(OrderModel.RESERVABLE_STATUS_CODES);

const list = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const search = req.query.search ? String(req.query.search).trim() : '';
    const statusId = req.query.status_id ? Number(req.query.status_id) : null;

    const [items, total] = await Promise.all([
      OrderModel.listAdmin({ limit, offset, search, statusId }),
      OrderModel.countAdmin({ search, statusId })
    ]);

    return ok(res, 'Orders', { items, pagination: buildPagination(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const order = await OrderModel.findAdminById(req.params.id);
    if (!order) return fail(res, 'Order not found', null, 404);

    const items = await OrderModel.getItemsByOrderId(req.params.id);
    return ok(res, 'Order', { ...order, items });
  } catch (err) {
    next(err);
  }
};

const listStatuses = async (req, res, next) => {
  try {
    const items = await OrderModel.listStatuses();
    return ok(res, 'Order statuses', { items });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const order = await OrderModel.findAdminById(req.params.id);
    if (!order) return fail(res, 'Order not found', null, 404);

    let nextStatus = null;
    if (req.body.status_id !== undefined) {
      nextStatus = await OrderModel.findStatusById(req.body.status_id);
    } else if (req.body.status_code !== undefined) {
      nextStatus = await OrderModel.findStatusByCode(req.body.status_code);
    }

    if (!nextStatus) {
      return fail(res, 'Valid status is required', null, 400);
    }

    await OrderModel.updateStatus(req.params.id, nextStatus.id);

    await ActivityService.log(req.user.id, 'UPDATE_ORDER_STATUS', 'orders', req.params.id, {
      status_id: nextStatus.id,
      status_code: nextStatus.code
    });

    return ok(res, 'Order status updated', {
      id: Number(req.params.id),
      status_id: nextStatus.id,
      status_code: nextStatus.code,
      status_name: nextStatus.name
    });
  } catch (err) {
    next(err);
  }
};

const listItemStores = async (req, res, next) => {
  try {
    const order = await OrderModel.findAdminById(req.params.id);
    if (!order) return fail(res, 'Order not found', null, 404);

    const item = await OrderModel.findItemByOrderAndId(req.params.id, req.params.itemId);
    if (!item) return fail(res, 'Order item not found', null, 404);

    const stores = await OrderModel.listAssignableStoresForOrderItem({
      orderId: req.params.id,
      itemId: req.params.itemId
    });

    return ok(res, 'Order item stores', {
      order_id: Number(req.params.id),
      item_id: Number(req.params.itemId),
      quantity: Number(item.quantity || 0),
      stores
    });
  } catch (err) {
    next(err);
  }
};

const assignItemStore = async (req, res, next) => {
  try {
    const order = await OrderModel.findAdminById(req.params.id);
    if (!order) return fail(res, 'Order not found', null, 404);

    const item = await OrderModel.findItemByOrderAndId(req.params.id, req.params.itemId);
    if (!item) return fail(res, 'Order item not found', null, 404);

    if (!ASSIGNABLE_STATUS_CODES.has(item.order_status_code)) {
      return fail(res, 'Store assignment is allowed only for active orders', null, 400);
    }

    let storeId = null;
    if (req.body.store_id !== undefined && req.body.store_id !== null && req.body.store_id !== '') {
      storeId = Number(req.body.store_id);
      if (!storeId || Number.isNaN(storeId)) {
        return fail(res, 'Valid store is required', null, 400);
      }

      const mapping = await OrderModel.getStoreProductMapping(storeId, item.product_id);
      if (!mapping) {
        return fail(res, 'Store does not provide this product', null, 400);
      }
      if (!mapping.is_available) {
        return fail(res, 'Product is not available in this store', null, 400);
      }

      const reservedQty = await OrderModel.getReservedQtyForStoreProduct({
        storeId,
        productId: item.product_id,
        excludeItemId: item.id
      });
      const availableQty = Number(mapping.stock || 0) - reservedQty;
      if (availableQty < Number(item.quantity || 0)) {
        return fail(res, 'Not enough available stock in this store', null, 400);
      }
    }

    await OrderModel.assignStoreToItem({
      orderId: req.params.id,
      itemId: req.params.itemId,
      storeId
    });

    await ActivityService.log(req.user.id, 'ASSIGN_ORDER_ITEM_STORE', 'order_items', req.params.itemId, {
      order_id: Number(req.params.id),
      store_id: storeId
    });

    return ok(res, storeId ? 'Store assigned to order item' : 'Store unassigned from order item', {
      order_id: Number(req.params.id),
      item_id: Number(req.params.itemId),
      store_id: storeId
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  getById,
  listStatuses,
  updateStatus,
  listItemStores,
  assignItemStore
};
