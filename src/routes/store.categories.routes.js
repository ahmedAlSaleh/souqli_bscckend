const express = require('express');
const controller = require('../controllers/store/category.controller');

const router = express.Router();

router.get('/', controller.tree);

module.exports = router;
