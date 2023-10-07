const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/productController');

router.post('/createProductReviews', productCtrl.createProductReviews);
router.get('/:Slugs', productCtrl.index);


module.exports = router;