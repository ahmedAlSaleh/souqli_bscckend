const CategoryModel = require('../../models/category.model');
const AttributeModel = require('../../models/attribute.model');
const CategoryAttributeModel = require('../../models/category-attribute.model');
const ActivityService = require('../../services/activity.service');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const { ok, fail } = require('../../utils/response');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      CategoryModel.listSubcategoriesPaginated({ limit, offset }),
      CategoryModel.countSubcategories()
    ]);
    return ok(res, 'Subcategories', { items, pagination: buildPagination(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

const listAttributes = async (req, res, next) => {
  try {
    const category = await CategoryModel.findById(req.params.id);
    if (!category) return fail(res, 'Subcategory not found', null, 404);
    if (!category.parent_id) return fail(res, 'Category is not a subcategory', null, 400);

    const items = await CategoryAttributeModel.listByCategoryId(req.params.id);
    const enriched = await Promise.all(
      items.map(async (item) => {
        if (item.data_type === 'select') {
          const options = await AttributeModel.listOptions(item.attribute_id);
          return { ...item, options };
        }
        return { ...item, options: [] };
      })
    );

    return ok(res, 'Subcategory attributes', {
      category_id: Number(req.params.id),
      items: enriched
    });
  } catch (err) {
    next(err);
  }
};

const attachAttribute = async (req, res, next) => {
  try {
    const category = await CategoryModel.findById(req.params.id);
    if (!category) return fail(res, 'Subcategory not found', null, 404);
    if (!category.parent_id) return fail(res, 'Category is not a subcategory', null, 400);

    const attribute = await AttributeModel.findById(req.body.attribute_id);
    if (!attribute) return fail(res, 'Attribute not found', null, 404);

    const id = await CategoryAttributeModel.attach({
      category_id: Number(req.params.id),
      attribute_id: Number(req.body.attribute_id),
      is_required: req.body.is_required ?? false,
      sort_order: req.body.sort_order ?? 0
    });

    await ActivityService.log(req.user.id, 'ATTACH_ATTRIBUTE', 'category_attributes', id, {
      category_id: Number(req.params.id),
      attribute_id: Number(req.body.attribute_id)
    });

    return ok(res, 'Attribute linked', { id }, 201);
  } catch (err) {
    next(err);
  }
};

const updateAttribute = async (req, res, next) => {
  try {
    const category = await CategoryModel.findById(req.params.id);
    if (!category) return fail(res, 'Subcategory not found', null, 404);
    if (!category.parent_id) return fail(res, 'Category is not a subcategory', null, 400);

    const map = await CategoryAttributeModel.findMapById(req.params.mapId);
    if (!map || Number(map.category_id) !== Number(req.params.id)) {
      return fail(res, 'Mapping not found', null, 404);
    }

    const affected = await CategoryAttributeModel.update(req.params.mapId, req.body);
    if (!affected) return fail(res, 'No changes', null, 400);

    await ActivityService.log(req.user.id, 'UPDATE_CATEGORY_ATTRIBUTE', 'category_attributes', req.params.mapId, req.body);
    return ok(res, 'Attribute mapping updated', { id: Number(req.params.mapId) });
  } catch (err) {
    next(err);
  }
};

const removeAttribute = async (req, res, next) => {
  try {
    const map = await CategoryAttributeModel.findMapById(req.params.mapId);
    if (!map || Number(map.category_id) !== Number(req.params.id)) {
      return fail(res, 'Mapping not found', null, 404);
    }

    const affected = await CategoryAttributeModel.remove(req.params.mapId);
    if (!affected) return fail(res, 'Mapping not found', null, 404);

    await ActivityService.log(req.user.id, 'REMOVE_CATEGORY_ATTRIBUTE', 'category_attributes', req.params.mapId, null);
    return ok(res, 'Attribute unlinked', { id: Number(req.params.mapId) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  listAttributes,
  attachAttribute,
  updateAttribute,
  removeAttribute
};
