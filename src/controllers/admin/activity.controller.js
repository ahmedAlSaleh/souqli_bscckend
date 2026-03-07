const ActivityService = require('../../services/activity.service');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const { ok } = require('../../utils/response');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { items, total } = await ActivityService.list({
      limit,
      offset,
      search: req.query.search ? String(req.query.search).trim() : '',
      action: req.query.action ? String(req.query.action).trim() : '',
      entity_type: req.query.entity_type ? String(req.query.entity_type).trim() : '',
      user_id: req.query.user_id ? Number(req.query.user_id) : null,
      date_from: req.query.date_from || null,
      date_to: req.query.date_to || null
    });
    return ok(res, 'Activity logs', { items, pagination: buildPagination(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

module.exports = { list };
