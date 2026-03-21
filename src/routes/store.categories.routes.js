const express = require('express');
const { param } = require('express-validator');
const controller = require('../controllers/store/category.controller');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', controller.tree);
router.get('/:id/size-chart', [param('id').isInt()], validate, controller.sizeChart);

module.exports = router;
