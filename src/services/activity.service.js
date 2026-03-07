const ActivityModel = require('../models/activity.model');

const log = async (userId, action, entityType, entityId, meta) => {
  return ActivityModel.create({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    meta
  });
};

const list = async (filters) => {
  const { limit, offset, search, action, entity_type, user_id, date_from, date_to } = filters;
  const [items, total] = await Promise.all([
    ActivityModel.listPaginated({
      limit,
      offset,
      search,
      action,
      entityType: entity_type,
      userId: user_id,
      dateFrom: date_from,
      dateTo: date_to
    }),
    ActivityModel.countAll({
      search,
      action,
      entityType: entity_type,
      userId: user_id,
      dateFrom: date_from,
      dateTo: date_to
    })
  ]);
  return { items, total };
};

module.exports = { log, list };
