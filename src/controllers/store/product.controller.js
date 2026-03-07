const ProductModel = require('../../models/product.model');
const AttributeModel = require('../../models/attribute.model');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const { ok, fail } = require('../../utils/response');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const search = req.query.q;
    const categoryId = req.query.category_id;
    const minPrice = req.query.min_price;
    const maxPrice = req.query.max_price;
    const city = req.query.city;

    const toBool = (value) => {
      if (value === undefined) return undefined;
      if (value === true || value === false) return value;
      const str = String(value).toLowerCase();
      return str === '1' || str === 'true';
    };

    const isNew = toBool(req.query.is_new);
    const isPopular = toBool(req.query.is_popular);
    const isDeal = toBool(req.query.is_deal);
    const sort = req.query.sort;

    const [items, total] = await Promise.all([
      ProductModel.listStore({
        limit,
        offset,
        search,
        categoryId,
        minPrice,
        maxPrice,
        isNew,
        isPopular,
        isDeal,
        sort,
        city
      }),
      ProductModel.countStore({
        search,
        categoryId,
        minPrice,
        maxPrice,
        isNew,
        isPopular,
        isDeal,
        city
      })
    ]);

    return ok(res, 'Products', { items, pagination: buildPagination(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product || !product.is_active) {
      return fail(res, 'Product not found', null, 404);
    }

    const images = await ProductModel.getImagesByProductId(req.params.id);
    const attributes = await ProductModel.getAttributesByProductId(req.params.id);
    const enrichedAttributes = await Promise.all(
      attributes.map(async (attr) => {
        if (attr.data_type === 'select') {
          const options = await AttributeModel.listOptions(attr.attribute_id);
          return { ...attr, options };
        }
        return { ...attr, options: [] };
      })
    );

    return ok(res, 'Product', { ...product, images, attributes: enrichedAttributes });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById };
