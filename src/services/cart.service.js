const CartModel = require('../models/cart.model');
const CartItemOptionsModel = require('../models/cart-item-options.model');
const ProductModel = require('../models/product.model');
const AttributeModel = require('../models/attribute.model');

const getOrCreateCart = async (userId) => {
  // Keep a single ACTIVE cart per user.
  let cart = await CartModel.getActiveCartByUserId(userId);
  if (!cart) {
    cart = await CartModel.createCart(userId);
  }
  return cart;
};

const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  const items = await CartModel.getItemsByCartId(cart.id);
  const optionRows = await CartItemOptionsModel.listByCartId(cart.id);
  if (optionRows.length) {
    const map = new Map();
    optionRows.forEach((row) => {
      if (!map.has(row.cart_item_id)) {
        map.set(row.cart_item_id, []);
      }
      map.get(row.cart_item_id).push({
        attribute_id: row.attribute_id,
        option_id: row.option_id,
        attribute_code: row.attribute_code,
        attribute_name: row.attribute_name,
        option_value: row.option_value
      });
    });
    items.forEach((item) => {
      item.options = map.get(item.id) || [];
    });
  } else {
    items.forEach((item) => {
      item.options = [];
    });
  }

  const totals = items.reduce(
    (acc, item) => {
      acc.subtotal += Number(item.unit_price) * item.quantity;
      acc.item_count += item.quantity;
      return acc;
    },
    { subtotal: 0, item_count: 0 }
  );

  return {
    cart,
    items,
    totals: { ...totals, total: totals.subtotal }
  };
};

const normalizeOptions = (options) => {
  if (!Array.isArray(options)) return [];
  return options
    .map((opt) => ({
      attribute_id: Number(opt.attribute_id),
      option_id: Number(opt.option_id)
    }))
    .filter((opt) => Number.isFinite(opt.attribute_id) && Number.isFinite(opt.option_id))
    .sort((a, b) => a.attribute_id - b.attribute_id);
};

const buildOptionsSignature = (options) => {
  if (!options.length) return null;
  return options.map((opt) => `${opt.attribute_id}:${opt.option_id}`).join('|');
};

const getAvailableStock = async (productId) => {
  const stock = await ProductModel.getStockByProductId(productId);
  const quantity = Number(stock.quantity || 0);
  const reserved = Number(stock.reserved_quantity || 0);
  return Math.max(quantity - reserved, 0);
};

const addItem = async (userId, payload) => {
  const cart = await getOrCreateCart(userId);
  const product = await ProductModel.findById(payload.product_id);

  if (!product || product.deleted_at || !product.is_active) {
    throw { status: 404, message: 'Product not found' };
  }

  let unitPrice = product.base_price;
  let variantId = payload.variant_id || null;
  const options = normalizeOptions(payload.options);
  const optionsSignature = buildOptionsSignature(options);

  if (options.length) {
    const valid = await AttributeModel.validateOptionPairs(options);
    if (!valid) {
      throw { status: 400, message: 'Invalid product options' };
    }
  }

  if (variantId) {
    const variant = await ProductModel.findVariantById(variantId);
    if (!variant || variant.product_id !== product.id) {
      throw { status: 400, message: 'Invalid variant' };
    }
    unitPrice = variant.price || product.base_price;
  }

  const available = await getAvailableStock(product.id);
  if (available <= 0) {
    throw { status: 409, message: 'Out of stock' };
  }

  const existing = await CartModel.findItem(cart.id, product.id, variantId, optionsSignature);
  const requested = Number(payload.quantity || 0);
  if (requested < 1) {
    throw { status: 400, message: 'Quantity must be at least 1' };
  }
  const finalQty = existing ? existing.quantity + requested : requested;
  if (finalQty > available) {
    throw { status: 409, message: `Only ${available} left in stock` };
  }

  if (existing) {
    await CartModel.updateItemQuantity(existing.id, cart.id, finalQty);
    return { item_id: existing.id, cart_id: cart.id };
  }

  const itemId = await CartModel.addItem(
    cart.id,
    product.id,
    variantId,
    requested,
    unitPrice,
    optionsSignature
  );

  if (options.length) {
    await CartItemOptionsModel.replaceForItem(itemId, options);
  }

  return { item_id: itemId, cart_id: cart.id };
};

const updateItem = async (userId, itemId, quantity) => {
  const cart = await getOrCreateCart(userId);
  const item = await CartModel.findItemById(itemId, cart.id);
  if (!item) throw { status: 404, message: 'Cart item not found' };

  const available = await getAvailableStock(item.product_id);
  if (available <= 0) {
    throw { status: 409, message: 'Out of stock' };
  }
  if (quantity > available) {
    throw { status: 409, message: `Only ${available} left in stock` };
  }

  const affected = await CartModel.updateItemQuantity(itemId, cart.id, quantity);
  if (!affected) throw { status: 404, message: 'Cart item not found' };
  return true;
};

const removeItem = async (userId, itemId) => {
  const cart = await getOrCreateCart(userId);
  const affected = await CartModel.deleteItem(itemId, cart.id);
  if (!affected) throw { status: 404, message: 'Cart item not found' };
  return true;
};

module.exports = { getCart, addItem, updateItem, removeItem };
