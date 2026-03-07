const { fail } = require('../utils/response');

module.exports = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Server error';
  const errors = err.errors || null;
  return fail(res, message, errors, status);
};
