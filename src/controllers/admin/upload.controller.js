const { ok, fail } = require('../../utils/response');
const { sanitizeFolder } = require('../../middlewares/uploadImage');

const uploadSingleImage = async (req, res, next) => {
  try {
    if (!req.file) return fail(res, 'Image file is required', null, 400);
    const folder = sanitizeFolder(req.uploadFolder || req.body?.folder || req.query?.folder);
    const url = `/api/uploads/${folder}/${req.file.filename}`;

    return ok(res, 'Image uploaded', {
      url,
      filename: req.file.filename,
      size: req.file.size,
      mime_type: req.file.mimetype
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadSingleImage
};
