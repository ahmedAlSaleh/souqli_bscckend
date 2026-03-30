const { fail } = require('../utils/response');

module.exports = (err, req, res, next) => {
  console.error(err);
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return fail(res, 'Image size must be 5MB or less', null, 400);
  }
  const status = err.status || 500;
  const message = err.message || 'Server error';
  const errors = err.errors || null;
  return fail(res, message, errors, status);
};
