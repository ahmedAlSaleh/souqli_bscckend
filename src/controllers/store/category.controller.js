const CategoryService = require('../../services/category.service');
const CategoryModel = require('../../models/category.model');
const SizeChartModel = require('../../models/size-chart.model');
const { ok } = require('../../utils/response');

const tree = async (req, res, next) => {
  try {
    const items = await CategoryService.getTree();
    return ok(res, 'Categories', items);
  } catch (err) {
    next(err);
  }
};

const sizeChart = async (req, res, next) => {
  try {
    const category = await CategoryModel.findById(req.params.id);
    if (!category || !category.parent_id) {
      return ok(res, 'Size chart', { category_id: Number(req.params.id), items: [] });
    }
    const items = await SizeChartModel.listByCategoryId(req.params.id);
    return ok(res, 'Size chart', { category_id: Number(req.params.id), items });
  } catch (err) {
    next(err);
  }
};

module.exports = { tree, sizeChart };
