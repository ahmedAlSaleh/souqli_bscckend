const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const uploadsRoot = path.join(__dirname, '..', '..', 'public', 'uploads');
const allowedFolders = new Set(['categories', 'products', 'stores', 'home-banners', 'general']);

const sanitizeFolder = (folder) => {
  const raw = String(folder || 'general').trim().toLowerCase();
  return allowedFolders.has(raw) ? raw : 'general';
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const folder = sanitizeFolder(req.body?.folder || req.query?.folder);
      const target = path.join(uploadsRoot, folder);
      fs.mkdirSync(target, { recursive: true });
      req.uploadFolder = folder;
      cb(null, target);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const seed = crypto.randomBytes(6).toString('hex');
    const name = `${Date.now()}-${seed}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    const err = new Error('Only image files are allowed');
    err.status = 400;
    cb(err);
    return;
  }
  cb(null, true);
};

const uploadImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter
});

module.exports = {
  uploadImage,
  sanitizeFolder
};
