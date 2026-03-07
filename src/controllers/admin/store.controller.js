const StoreModel = require('../../models/store.model');
const StorePhoneModel = require('../../models/store-phone.model');
const StoreHourModel = require('../../models/store-hour.model');
const StoreProductModel = require('../../models/store-product.model');
const ProductModel = require('../../models/product.model');
const ActivityService = require('../../services/activity.service');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const { ok, fail } = require('../../utils/response');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const search = req.query.search ? String(req.query.search).trim() : '';
    const [items, total] = await Promise.all([
      StoreModel.listPaginated({ limit, offset, search }),
      StoreModel.countAll({ search })
    ]);
    return ok(res, 'Stores', { items, pagination: buildPagination(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const store = await StoreModel.findById(req.params.id);
    if (!store) return fail(res, 'Store not found', null, 404);
    return ok(res, 'Store', store);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const id = await StoreModel.create({
      name: req.body.name,
      logo_url: req.body.logo_url,
      whatsapp: req.body.whatsapp,
      address: req.body.address,
      city: req.body.city,
      owner_user_id: req.user.id
    });
    await ActivityService.log(req.user.id, 'CREATE_STORE', 'stores', id, { name: req.body.name });
    return ok(res, 'Store created', { id }, 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const affected = await StoreModel.update(req.params.id, req.body);
    if (!affected) return fail(res, 'Store not found or no changes', null, 404);

    await ActivityService.log(req.user.id, 'UPDATE_STORE', 'stores', req.params.id, req.body);
    return ok(res, 'Store updated', { id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const affected = await StoreModel.softDelete(req.params.id);
    if (!affected) return fail(res, 'Store not found', null, 404);

    await ActivityService.log(req.user.id, 'DELETE_STORE', 'stores', req.params.id, null);
    return ok(res, 'Store deleted', { id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
};

const listPhones = async (req, res, next) => {
  try {
    const store = await StoreModel.findById(req.params.id);
    if (!store) return fail(res, 'Store not found', null, 404);

    const items = await StorePhoneModel.listByStoreId(req.params.id);
    return ok(res, 'Store phones', { items });
  } catch (err) {
    next(err);
  }
};

const createPhone = async (req, res, next) => {
  try {
    const store = await StoreModel.findById(req.params.id);
    if (!store) return fail(res, 'Store not found', null, 404);

    const id = await StorePhoneModel.create(req.params.id, req.body);
    return ok(res, 'Phone created', { id }, 201);
  } catch (err) {
    next(err);
  }
};

const updatePhone = async (req, res, next) => {
  try {
    const store = await StoreModel.findById(req.params.id);
    if (!store) return fail(res, 'Store not found', null, 404);

    const affected = await StorePhoneModel.update(req.params.phoneId, req.params.id, req.body);
    if (!affected) return fail(res, 'Phone not found', null, 404);
    return ok(res, 'Phone updated', { id: Number(req.params.phoneId) });
  } catch (err) {
    next(err);
  }
};

const deletePhone = async (req, res, next) => {
  try {
    const store = await StoreModel.findById(req.params.id);
    if (!store) return fail(res, 'Store not found', null, 404);

    const affected = await StorePhoneModel.softDelete(req.params.phoneId, req.params.id);
    if (!affected) return fail(res, 'Phone not found', null, 404);
    return ok(res, 'Phone deleted', { id: Number(req.params.phoneId) });
  } catch (err) {
    next(err);
  }
};

const listHours = async (req, res, next) => {
  try {
    const store = await StoreModel.findById(req.params.id);
    if (!store) return fail(res, 'Store not found', null, 404);

    const items = await StoreHourModel.listByStoreId(req.params.id);
    return ok(res, 'Store hours', { items });
  } catch (err) {
    next(err);
  }
};

const upsertHours = async (req, res, next) => {
  try {
    const store = await StoreModel.findById(req.params.id);
    if (!store) return fail(res, 'Store not found', null, 404);

    await StoreHourModel.upsertMany(req.params.id, req.body.hours || []);
    return ok(res, 'Store hours updated', { id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
};

const listStoreProducts = async (req, res, next) => {
  try {
    const store = await StoreModel.findById(req.params.id);
    if (!store) return fail(res, 'Store not found', null, 404);

    const { page, limit, offset } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      StoreProductModel.listByStoreId({ storeId: req.params.id, limit, offset }),
      StoreProductModel.countByStoreId(req.params.id)
    ]);
    return ok(res, 'Store products', { items, pagination: buildPagination(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

const attachStoreProduct = async (req, res, next) => {
  try {
    const store = await StoreModel.findById(req.params.id);
    if (!store) return fail(res, 'Store not found', null, 404);

    const product = await ProductModel.findById(req.body.product_id);
    if (!product) return fail(res, 'Product not found', null, 404);

    await StoreProductModel.upsert({
      store_id: Number(req.params.id),
      product_id: Number(req.body.product_id),
      stock: req.body.stock ?? 0,
      price_override: req.body.price_override ?? null,
      is_available: req.body.is_available !== undefined ? req.body.is_available : true
    });
    return ok(res, 'Store product attached', null, 201);
  } catch (err) {
    next(err);
  }
};

const updateStoreProduct = async (req, res, next) => {
  try {
    const store = await StoreModel.findById(req.params.id);
    if (!store) return fail(res, 'Store not found', null, 404);

    const mapping = await StoreProductModel.findById(req.params.mapId);
    if (!mapping || Number(mapping.store_id) !== Number(req.params.id)) {
      return fail(res, 'Store product not found', null, 404);
    }

    const affected = await StoreProductModel.updateById(req.params.mapId, req.body);
    if (!affected) return fail(res, 'Store product not found', null, 404);
    return ok(res, 'Store product updated', { id: Number(req.params.mapId) });
  } catch (err) {
    next(err);
  }
};

const deleteStoreProduct = async (req, res, next) => {
  try {
    const store = await StoreModel.findById(req.params.id);
    if (!store) return fail(res, 'Store not found', null, 404);

    const mapping = await StoreProductModel.findById(req.params.mapId);
    if (!mapping || Number(mapping.store_id) !== Number(req.params.id)) {
      return fail(res, 'Store product not found', null, 404);
    }

    const affected = await StoreProductModel.softDelete(req.params.mapId);
    if (!affected) return fail(res, 'Store product not found', null, 404);
    return ok(res, 'Store product deleted', { id: Number(req.params.mapId) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  listPhones,
  createPhone,
  updatePhone,
  deletePhone,
  listHours,
  upsertHours,
  listStoreProducts,
  attachStoreProduct,
  updateStoreProduct,
  deleteStoreProduct
};
