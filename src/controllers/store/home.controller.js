const HomeService = require('../../services/home.service');
const { ok } = require('../../utils/response');

const getHome = async (req, res, next) => {
  try {
    const data = await HomeService.getHomeData();
    return ok(res, 'Home', data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getHome };
