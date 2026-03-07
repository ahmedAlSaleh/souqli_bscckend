const CategoryModel = require('../../models/category.model');
const ActivityService = require('../../services/activity.service');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const { ok, fail } = require('../../utils/response');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      CategoryModel.listPaginated({ limit, offset }),
      CategoryModel.countAll()
    ]);
    return ok(res, 'Categories', { items, pagination: buildPagination(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const item = await CategoryModel.findById(req.params.id);
    if (!item) return fail(res, 'Category not found', null, 404);
    return ok(res, 'Category', item);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    if (req.body.parent_id) {
      const parent = await CategoryModel.findById(req.body.parent_id);
      if (!parent) return fail(res, 'Parent category not found', null, 400);
      if (parent.parent_id) {
        return fail(res, 'Parent category must be a main category', null, 400);
      }
    }
    const id = await CategoryModel.create(req.body);
    await ActivityService.log(req.user.id, 'CREATE_CATEGORY', 'categories', id, {
      name: req.body.name
    });
    return ok(res, 'Category created', { id }, 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    if (req.body.parent_id !== undefined) {
      if (Number(req.body.parent_id) === Number(req.params.id)) {
        return fail(res, 'Category cannot be its own parent', null, 400);
      }
      if (req.body.parent_id) {
        const parent = await CategoryModel.findById(req.body.parent_id);
        if (!parent) return fail(res, 'Parent category not found', null, 400);
        if (parent.parent_id) {
          return fail(res, 'Parent category must be a main category', null, 400);
        }
      }
    }
    const affected = await CategoryModel.update(req.params.id, req.body);
    if (!affected) return fail(res, 'Category not found or no changes', null, 404);

    await ActivityService.log(req.user.id, 'UPDATE_CATEGORY', 'categories', req.params.id, req.body);
    return ok(res, 'Category updated', { id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const affected = await CategoryModel.softDelete(req.params.id);
    if (!affected) return fail(res, 'Category not found', null, 404);

    await ActivityService.log(req.user.id, 'DELETE_CATEGORY', 'categories', req.params.id, null);
    return ok(res, 'Category deleted', { id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, remove };
