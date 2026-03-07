const pool = require('../config/db');
const ProductModel = require('../models/product.model');
const CategoryModel = require('../models/category.model');
const AttributeModel = require('../models/attribute.model');
const CategoryAttributeModel = require('../models/category-attribute.model');
const ProductStockModel = require('../models/product-stock.model');
const StoreModel = require('../models/store.model');
const StoreProductModel = require('../models/store-product.model');

const makeError = (message, status = 400, errors = null) => {
  const err = new Error(message);
  err.status = status;
  if (errors) err.errors = errors;
  return err;
};

const normalizeAttributes = (attributes) => {
  if (!Array.isArray(attributes)) return [];
  return attributes.map((item) => ({
    attribute_id: Number(item.attribute_id),
    option_id:
      item.option_id !== undefined && item.option_id !== null && item.option_id !== ''
        ? Number(item.option_id)
        : null,
    value_text: item.value_text === '' ? null : item.value_text ?? null,
    value_number:
      item.value_number !== undefined && item.value_number !== null && item.value_number !== ''
        ? Number(item.value_number)
        : null,
    value_boolean: item.value_boolean !== undefined ? Boolean(item.value_boolean) : null,
    value_date: item.value_date === '' ? null : item.value_date ?? null
  }));
};

const validateCategoryIsSubcategory = async (categoryId) => {
  const category = await CategoryModel.findById(categoryId);
  if (!category) throw makeError('Category not found', 404);
  if (!category.parent_id) throw makeError('Category must be a subcategory', 400);
  return category;
};

const validateAttributesPayload = async ({ categoryId, attributes, existingAttributeIds = [] }) => {
  const template = await CategoryAttributeModel.listByCategoryId(categoryId);
  const templateMap = new Map(template.map((t) => [Number(t.attribute_id), t]));
  const requiredIds = template.filter((t) => t.is_required).map((t) => Number(t.attribute_id));

  const normalized = normalizeAttributes(attributes);
  const providedIds = new Set();
  const errors = [];

  for (const attr of normalized) {
    if (!attr.attribute_id) {
      errors.push({ msg: 'Attribute ID is required' });
      continue;
    }
    if (providedIds.has(attr.attribute_id)) {
      errors.push({ msg: `Duplicate attribute ${attr.attribute_id}` });
      continue;
    }
    providedIds.add(attr.attribute_id);

    const templateEntry = templateMap.get(attr.attribute_id);
    if (!templateEntry) {
      errors.push({ msg: `Attribute ${attr.attribute_id} is not part of this subcategory template` });
      continue;
    }

    const type = templateEntry.data_type;
    const hasValue =
      attr.option_id !== null ||
      attr.value_text !== null ||
      attr.value_number !== null ||
      attr.value_boolean !== null ||
      attr.value_date !== null;

    if (!hasValue) {
      errors.push({ msg: `${templateEntry.name} requires a value` });
      continue;
    }

    if (type === 'select') {
      if (!attr.option_id) {
        errors.push({ msg: `${templateEntry.name} requires a valid option` });
        continue;
      }
      const options = await AttributeModel.listOptions(attr.attribute_id);
      const valid = options.some((opt) => Number(opt.id) === Number(attr.option_id));
      if (!valid) {
        errors.push({ msg: `${templateEntry.name} option is invalid` });
      }
      attr.value_text = null;
      attr.value_number = null;
      attr.value_boolean = null;
      attr.value_date = null;
    } else if (type === 'number') {
      if (attr.value_number === null || Number.isNaN(attr.value_number)) {
        errors.push({ msg: `${templateEntry.name} requires a number` });
      }
      attr.option_id = null;
      attr.value_text = null;
      attr.value_boolean = null;
      attr.value_date = null;
    } else if (type === 'boolean') {
      if (attr.value_boolean === null) {
        errors.push({ msg: `${templateEntry.name} requires true or false` });
      }
      attr.option_id = null;
      attr.value_text = null;
      attr.value_number = null;
      attr.value_date = null;
    } else if (type === 'date') {
      if (!attr.value_date) {
        errors.push({ msg: `${templateEntry.name} requires a date` });
      }
      attr.option_id = null;
      attr.value_text = null;
      attr.value_number = null;
      attr.value_boolean = null;
    } else {
      if (!attr.value_text) {
        errors.push({ msg: `${templateEntry.name} requires text` });
      }
      attr.option_id = null;
      attr.value_number = null;
      attr.value_boolean = null;
      attr.value_date = null;
    }
  }

  const existingSet = new Set(existingAttributeIds.map((id) => Number(id)));
  const missingRequired = requiredIds.filter((id) => !providedIds.has(id) && !existingSet.has(id));
  if (missingRequired.length) {
    errors.push({ msg: 'Required attributes are missing', missing: missingRequired });
  }

  if (errors.length) {
    throw makeError('Invalid attributes', 400, errors);
  }

  return normalized;
};

const normalizeStores = (stores) => {
  if (!Array.isArray(stores)) return [];
  return stores.map((item) => ({
    store_id: Number(item.store_id),
    stock:
      item.stock !== undefined && item.stock !== null && item.stock !== ''
        ? Number(item.stock)
        : 0,
    price_override:
      item.price_override !== undefined && item.price_override !== null && item.price_override !== ''
        ? Number(item.price_override)
        : null,
    is_available: item.is_available !== undefined ? Boolean(item.is_available) : true
  }));
};

const validateStoresPayload = async (stores) => {
  if (!Array.isArray(stores) || !stores.length) {
    throw makeError('At least one store is required', 400);
  }

  const normalized = normalizeStores(stores);
  const errors = [];
  const ids = [];
  const seen = new Set();

  for (const entry of normalized) {
    if (!entry.store_id || Number.isNaN(entry.store_id)) {
      errors.push({ msg: 'Store ID is required' });
      continue;
    }
    if (seen.has(entry.store_id)) {
      errors.push({ msg: `Duplicate store ${entry.store_id}` });
      continue;
    }
    seen.add(entry.store_id);
    ids.push(entry.store_id);

    if (entry.stock < 0 || Number.isNaN(entry.stock)) {
      errors.push({ msg: `Invalid stock for store ${entry.store_id}` });
    }
    if (entry.price_override !== null && (entry.price_override < 0 || Number.isNaN(entry.price_override))) {
      errors.push({ msg: `Invalid price override for store ${entry.store_id}` });
    }
  }

  const found = await StoreModel.findByIds(ids);
  const foundIds = new Set(found.map((row) => Number(row.id)));
  const missing = ids.filter((id) => !foundIds.has(Number(id)));
  if (missing.length) {
    errors.push({ msg: 'Some stores do not exist', missing });
  }

  if (errors.length) {
    throw makeError('Invalid stores', 400, errors);
  }

  return normalized;
};

const normalizeStock = (stock) => ({
  quantity:
    stock?.quantity !== undefined && stock?.quantity !== null && stock?.quantity !== ''
      ? Number(stock.quantity)
      : 0,
  reserved_quantity:
    stock?.reserved_quantity !== undefined && stock?.reserved_quantity !== null && stock?.reserved_quantity !== ''
      ? Number(stock.reserved_quantity)
      : 0
});

const validateStockPayload = (stock) => {
  if (!stock) return null;
  const normalized = normalizeStock(stock);
  const errors = [];

  if (Number.isNaN(normalized.quantity) || normalized.quantity < 0) {
    errors.push({ msg: 'Stock quantity must be a non-negative number' });
  }
  if (Number.isNaN(normalized.reserved_quantity) || normalized.reserved_quantity < 0) {
    errors.push({ msg: 'Reserved quantity must be a non-negative number' });
  }
  if (normalized.reserved_quantity > normalized.quantity) {
    errors.push({ msg: 'Reserved quantity cannot exceed total quantity' });
  }

  if (errors.length) {
    throw makeError('Invalid stock', 400, errors);
  }

  return normalized;
};

const createProduct = async (data) => {
  await validateCategoryIsSubcategory(data.category_id);
  const normalizedAttributes = await validateAttributesPayload({
    categoryId: data.category_id,
    attributes: data.attributes || [],
    existingAttributeIds: []
  });
  const normalizedStores = await validateStoresPayload(data.stores);
  const normalizedStock = validateStockPayload(data.stock);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const productId = await ProductModel.create(data, conn);

    if (data.images && data.images.length) {
      await ProductModel.replaceImages(productId, data.images, conn);
    }
    if (normalizedAttributes.length) {
      await ProductModel.upsertAttributes(productId, normalizedAttributes, conn);
    }
    if (normalizedStock) {
      await ProductStockModel.upsert(productId, normalizedStock, conn);
    }
    await StoreProductModel.syncForProduct(productId, normalizedStores, conn);

    await conn.commit();
    return productId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const updateProduct = async (id, data) => {
  const existing = await ProductModel.findById(id);
  if (!existing) return false;

  const categoryId = data.category_id ?? existing.category_id;
  await validateCategoryIsSubcategory(categoryId);

  let normalizedAttributes = null;
  let normalizedStores = null;
  let normalizedStock = null;
  if (Object.prototype.hasOwnProperty.call(data, 'attributes')) {
    const existingValues = await ProductModel.getAttributesByProductId(id);
    normalizedAttributes = await validateAttributesPayload({
      categoryId,
      attributes: data.attributes || [],
      existingAttributeIds: existingValues.map((row) => row.attribute_id)
    });
  }
  if (Object.prototype.hasOwnProperty.call(data, 'stores')) {
    normalizedStores = await validateStoresPayload(data.stores);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'stock')) {
    normalizedStock = validateStockPayload(data.stock);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const hasFields = Object.keys(data).some(
      (k) => k !== 'images' && k !== 'attributes' && k !== 'stores' && k !== 'stock'
    );
    const hasImages = Object.prototype.hasOwnProperty.call(data, 'images');
    const hasAttributes = normalizedAttributes !== null;
    const hasStores = normalizedStores !== null;
    const hasStock = normalizedStock !== null;

    if (hasFields) {
      await ProductModel.update(id, data, conn);
    }
    if (hasImages) {
      await ProductModel.replaceImages(id, data.images, conn);
    }
    if (hasAttributes && normalizedAttributes.length) {
      await ProductModel.upsertAttributes(id, normalizedAttributes, conn);
    }
    if (hasStores) {
      await StoreProductModel.syncForProduct(id, normalizedStores, conn);
    }
    if (hasStock) {
      await ProductStockModel.upsert(id, normalizedStock, conn);
    }

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = { createProduct, updateProduct };
