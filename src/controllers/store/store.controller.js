const StoreModel = require('../../models/store.model');
const { ok } = require('../../utils/response');

const listCities = async (req, res, next) => {
  try {
    const cities = await StoreModel.listCities();
    return ok(res, 'Store cities', { items: cities });
  } catch (err) {
    next(err);
  }
};

module.exports = { listCities };
