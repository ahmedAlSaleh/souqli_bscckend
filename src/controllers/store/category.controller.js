const CategoryService = require('../../services/category.service');
const { ok } = require('../../utils/response');

const tree = async (req, res, next) => {
  try {
    const items = await CategoryService.getTree();
    return ok(res, 'Categories', items);
  } catch (err) {
    next(err);
  }
};

module.exports = { tree };
