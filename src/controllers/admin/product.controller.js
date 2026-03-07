const ProductModel = require('../../models/product.model');
const AttributeModel = require('../../models/attribute.model');
const ProductStockModel = require('../../models/product-stock.model');
const ProductVariantModel = require('../../models/product-variant.model');
const StoreProductModel = require('../../models/store-product.model');
const ProductService = require('../../services/product.service');
const ActivityService = require('../../services/activity.service');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const { ok, fail } = require('../../utils/response');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      ProductModel.listAdmin({ limit, offset }),
      ProductModel.countAdmin()
    ]);
    return ok(res, 'Products', { items, pagination: buildPagination(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return fail(res, 'Product not found', null, 404);

    const images = await ProductModel.getImagesByProductId(req.params.id);
    const attributes = await ProductModel.getAttributesByProductId(req.params.id);
    const stock = await ProductStockModel.getByProductId(req.params.id);
    const stores = await StoreProductModel.listByProductId(req.params.id);
    const enrichedAttributes = await Promise.all(
      attributes.map(async (attr) => {
        if (attr.data_type === 'select') {
          const options = await AttributeModel.listOptions(attr.attribute_id);
          return { ...attr, options };
        }
        return { ...attr, options: [] };
      })
    );
    return ok(res, 'Product', {
      ...product,
      images,
      attributes: enrichedAttributes,
      stores,
      stock: stock || { product_id: Number(req.params.id), quantity: 0, reserved_quantity: 0 }
    });
  } catch (err) {
    next(err);
  }
};

const listStores = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return fail(res, 'Product not found', null, 404);

    const items = await StoreProductModel.listByProductId(req.params.id);
    return ok(res, 'Product stores', { items });
  } catch (err) {
    next(err);
  }
};

const listVariants = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return fail(res, 'Product not found', null, 404);

    const items = await ProductVariantModel.listByProductId(req.params.id);
    return ok(res, 'Product variants', { items });
  } catch (err) {
    next(err);
  }
};

const createVariant = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return fail(res, 'Product not found', null, 404);

    const id = await ProductVariantModel.create(req.params.id, req.body);
    await ActivityService.log(req.user.id, 'CREATE_VARIANT', 'product_variants', id, {
      product_id: Number(req.params.id)
    });
    return ok(res, 'Variant created', { id }, 201);
  } catch (err) {
    next(err);
  }
};

const updateVariant = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return fail(res, 'Product not found', null, 404);

    const affected = await ProductVariantModel.update(req.params.variantId, req.params.id, req.body);
    if (!affected) return fail(res, 'Variant not found', null, 404);

    await ActivityService.log(req.user.id, 'UPDATE_VARIANT', 'product_variants', req.params.variantId, req.body);
    return ok(res, 'Variant updated', { id: Number(req.params.variantId) });
  } catch (err) {
    next(err);
  }
};

const deleteVariant = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return fail(res, 'Product not found', null, 404);

    const affected = await ProductVariantModel.softDelete(req.params.variantId, req.params.id);
    if (!affected) return fail(res, 'Variant not found', null, 404);

    await ActivityService.log(req.user.id, 'DELETE_VARIANT', 'product_variants', req.params.variantId, null);
    return ok(res, 'Variant deleted', { id: Number(req.params.variantId) });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const productId = await ProductService.createProduct(req.body);
    await ActivityService.log(req.user.id, 'CREATE_PRODUCT', 'products', productId, {
      name: req.body.name
    });
    return ok(res, 'Product created', { id: productId }, 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const hasImages = Object.prototype.hasOwnProperty.call(req.body, 'images');
    const hasAttributes = Object.prototype.hasOwnProperty.call(req.body, 'attributes');
    const hasStores = Object.prototype.hasOwnProperty.call(req.body, 'stores');
    const hasFields = Object.keys(req.body).some((k) => !['images', 'attributes', 'stores'].includes(k));
    if (!hasImages && !hasFields && !hasAttributes && !hasStores) {
      return fail(res, 'No data to update', null, 400);
    }

    const updated = await ProductService.updateProduct(req.params.id, req.body);
    if (!updated) return fail(res, 'Product not found', null, 404);

    await ActivityService.log(req.user.id, 'UPDATE_PRODUCT', 'products', req.params.id, req.body);
    return ok(res, 'Product updated', { id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const affected = await ProductModel.softDelete(req.params.id);
    if (!affected) return fail(res, 'Product not found', null, 404);

    await ActivityService.log(req.user.id, 'DELETE_PRODUCT', 'products', req.params.id, null);
    return ok(res, 'Product deleted', { id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  getById,
  listStores,
  listVariants,
  createVariant,
  updateVariant,
  deleteVariant,
  create,
  update,
  remove
};
