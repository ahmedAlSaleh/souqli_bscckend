const express = require('express');
const controller = require('../controllers/store/store.controller');

const router = express.Router();

router.get('/cities', controller.listCities);

module.exports = router;
