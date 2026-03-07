const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const { fail } = require('../utils/response');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return fail(res, 'Unauthorized', null, 401);
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(payload.id);

    // Load the user to avoid stale access after deactivation.
    if (!user || user.deleted_at || !user.is_active) {
      return fail(res, 'Unauthorized', null, 401);
    }

    req.user = { id: user.id, email: user.email, full_name: user.full_name };
    next();
  } catch (err) {
    return fail(res, 'Unauthorized', null, 401);
  }
};
