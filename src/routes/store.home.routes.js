const express = require('express');
const controller = require('../controllers/store/home.controller');

const router = express.Router();

router.get('/', controller.getHome);

module.exports = router;
