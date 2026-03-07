const { validationResult } = require('express-validator');
const { fail } = require('../utils/response');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return fail(res, 'Validation failed', errors.array(), 422);
  }
  next();
};
