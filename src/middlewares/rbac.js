const UserModel = require('../models/user.model');
const { fail } = require('../utils/response');

const requirePermission = (code) => async (req, res, next) => {
  try {
    const allowed = await UserModel.hasPermission(req.user.id, code);
    if (!allowed) {
      return fail(res, 'Forbidden', null, 403);
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requirePermission };
