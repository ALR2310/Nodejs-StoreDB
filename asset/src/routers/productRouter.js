const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/productController');

router.get('/:Id', productCtrl.index);

module.exports = router;