const AttributeModel = require('../../models/attribute.model');
const ActivityService = require('../../services/activity.service');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const { ok, fail } = require('../../utils/response');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      AttributeModel.listPaginated({ limit, offset }),
      AttributeModel.countAll()
    ]);
    return ok(res, 'Attributes', { items, pagination: buildPagination(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const item = await AttributeModel.findById(req.params.id);
    if (!item) return fail(res, 'Attribute not found', null, 404);
    return ok(res, 'Attribute', item);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const id = await AttributeModel.create(req.body);
    await ActivityService.log(req.user.id, 'CREATE_ATTRIBUTE', 'attributes', id, {
      code: req.body.code
    });
    return ok(res, 'Attribute created', { id }, 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const affected = await AttributeModel.update(req.params.id, req.body);
    if (!affected) return fail(res, 'Attribute not found or no changes', null, 404);

    await ActivityService.log(req.user.id, 'UPDATE_ATTRIBUTE', 'attributes', req.params.id, req.body);
    return ok(res, 'Attribute updated', { id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const affected = await AttributeModel.softDelete(req.params.id);
    if (!affected) return fail(res, 'Attribute not found', null, 404);

    await ActivityService.log(req.user.id, 'DELETE_ATTRIBUTE', 'attributes', req.params.id, null);
    return ok(res, 'Attribute deleted', { id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
};

const listOptions = async (req, res, next) => {
  try {
    const attribute = await AttributeModel.findById(req.params.id);
    if (!attribute) return fail(res, 'Attribute not found', null, 404);

    const items = await AttributeModel.listOptions(req.params.id);
    return ok(res, 'Attribute options', { attribute_id: Number(req.params.id), items });
  } catch (err) {
    next(err);
  }
};

const createOption = async (req, res, next) => {
  try {
    const attribute = await AttributeModel.findById(req.params.id);
    if (!attribute) return fail(res, 'Attribute not found', null, 404);

    const id = await AttributeModel.createOption(req.params.id, req.body);
    await ActivityService.log(req.user.id, 'CREATE_ATTRIBUTE_OPTION', 'attribute_options', id, req.body);
    return ok(res, 'Option created', { id }, 201);
  } catch (err) {
    next(err);
  }
};

const updateOption = async (req, res, next) => {
  try {
    const affected = await AttributeModel.updateOption(req.params.optionId, req.body);
    if (!affected) return fail(res, 'Option not found or no changes', null, 404);

    await ActivityService.log(req.user.id, 'UPDATE_ATTRIBUTE_OPTION', 'attribute_options', req.params.optionId, req.body);
    return ok(res, 'Option updated', { id: Number(req.params.optionId) });
  } catch (err) {
    next(err);
  }
};

const deleteOption = async (req, res, next) => {
  try {
    const affected = await AttributeModel.deleteOption(req.params.optionId);
    if (!affected) return fail(res, 'Option not found', null, 404);

    await ActivityService.log(req.user.id, 'DELETE_ATTRIBUTE_OPTION', 'attribute_options', req.params.optionId, null);
    return ok(res, 'Option deleted', { id: Number(req.params.optionId) });
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
  listOptions,
  createOption,
  updateOption,
  deleteOption
};
