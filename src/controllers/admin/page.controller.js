const PageModel = require('../../models/page.model');
const ActivityService = require('../../services/activity.service');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const { ok, fail } = require('../../utils/response');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      PageModel.listPaginated({ limit, offset }),
      PageModel.countAll()
    ]);
    return ok(res, 'Pages', { items, pagination: buildPagination(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const item = await PageModel.findById(req.params.id);
    if (!item) return fail(res, 'Page not found', null, 404);
    return ok(res, 'Page', item);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const id = await PageModel.create(req.body);
    await ActivityService.log(req.user.id, 'CREATE_PAGE', 'pages', id, { key: req.body.key });
    return ok(res, 'Page created', { id }, 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const affected = await PageModel.update(req.params.id, req.body);
    if (!affected) return fail(res, 'Page not found or no changes', null, 404);

    await ActivityService.log(req.user.id, 'UPDATE_PAGE', 'pages', req.params.id, req.body);
    return ok(res, 'Page updated', { id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const affected = await PageModel.remove(req.params.id);
    if (!affected) return fail(res, 'Page not found', null, 404);

    await ActivityService.log(req.user.id, 'DELETE_PAGE', 'pages', req.params.id, null);
    return ok(res, 'Page deleted', { id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, remove };
