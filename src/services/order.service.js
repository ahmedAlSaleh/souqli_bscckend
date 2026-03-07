const pool = require('../config/db');
const CartModel = require('../models/cart.model');
const OrderModel = require('../models/order.model');
const CartItemOptionsModel = require('../models/cart-item-options.model');
const OrderItemOptionsModel = require('../models/order-item-options.model');

// Use a transaction so the order and items stay in sync.
const createFromCart = async (userId, payload) => {
  const cart = await CartModel.getActiveCartByUserId(userId);
  if (!cart) throw { status: 400, message: 'No active cart' };

  const items = await CartModel.getItemsByCartId(cart.id);
  if (!items.length) throw { status: 400, message: 'Cart is empty' };

  const statusId = await OrderModel.findStatusId('PENDING');
  if (!statusId) throw { status: 500, message: 'Order status PENDING not found' };

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.unit_price) * item.quantity,
    0
  );

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const orderId = await OrderModel.create(
      {
        user_id: userId,
        status_id: statusId,
        address_id: payload.address_id,
        cart_id: cart.id,
        total_amount: totalAmount,
        currency: items[0].currency || 'USD',
        notes: payload.notes
      },
      conn
    );

    const orderItems = items.map((item) => ({
      cart_item_id: item.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: Number(item.unit_price) * item.quantity
    }));

    const createdItems = await OrderModel.addItems(orderId, orderItems, conn);

    const cartItemIds = createdItems.map((row) => row.cart_item_id).filter(Boolean);
    if (cartItemIds.length) {
      const optionRows = await CartItemOptionsModel.listByItemIds(cartItemIds);
      if (optionRows.length) {
        const idMap = new Map(createdItems.map((row) => [row.cart_item_id, row.order_item_id]));
        const orderOptionRows = optionRows
          .map((row) => ({
            order_item_id: idMap.get(row.cart_item_id),
            attribute_id: row.attribute_id,
            option_id: row.option_id
          }))
          .filter((row) => row.order_item_id);
        if (orderOptionRows.length) {
          await OrderItemOptionsModel.addForOrderItems(orderOptionRows, conn);
        }
      }
    }
    await OrderModel.updateCartStatus(cart.id, 'CONVERTED', conn);

    await conn.commit();
    return { order_id: orderId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const listMyOrders = async (userId, pagination) => {
  const { limit, offset } = pagination;
  const [orders, total] = await Promise.all([
    OrderModel.listByUser(userId, limit, offset),
    OrderModel.countByUser(userId)
  ]);

  for (const order of orders) {
    order.items = await OrderModel.getItemsByOrderId(order.id);
  }

  return { orders, total };
};

module.exports = { createFromCart, listMyOrders };
