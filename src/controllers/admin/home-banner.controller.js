const HomeBannerModel = require('../../models/home-banner.model');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const { ok, fail } = require('../../utils/response');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      HomeBannerModel.listAdmin({ limit, offset }),
      HomeBannerModel.countAdmin()
    ]);
    return ok(res, 'Home banners', { items, pagination: buildPagination(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const item = await HomeBannerModel.findById(req.params.id);
    if (!item) return fail(res, 'Home banner not found', null, 404);
    return ok(res, 'Home banner', item);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const id = await HomeBannerModel.create(req.body);
    return ok(res, 'Home banner created', { id }, 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const affected = await HomeBannerModel.update(req.params.id, req.body);
    if (!affected) return fail(res, 'Home banner not found', null, 404);
    return ok(res, 'Home banner updated', { id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const affected = await HomeBannerModel.softDelete(req.params.id);
    if (!affected) return fail(res, 'Home banner not found', null, 404);
    return ok(res, 'Home banner deleted', { id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove
};
