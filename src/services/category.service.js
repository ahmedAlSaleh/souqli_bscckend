const CategoryModel = require('../models/category.model');

// Build a tree so the frontend can render nested menus easily.
const getTree = async () => {
  const rows = await CategoryModel.listForTree();
  const map = new Map();
  const roots = [];

  rows.forEach((row) => {
    map.set(row.id, { ...row, children: [] });
  });

  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

module.exports = { getTree };
