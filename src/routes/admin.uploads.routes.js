const express = require('express');
const auth = require('../middlewares/auth');
const { uploadImage } = require('../middlewares/uploadImage');
const controller = require('../controllers/admin/upload.controller');

const router = express.Router();

router.use(auth);

router.post('/images', uploadImage.single('image'), controller.uploadSingleImage);

module.exports = router;
