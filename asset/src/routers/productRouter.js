const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/productController');

router.post('/createProductReviews', productCtrl.createProductReviews);
router.get('/loadMoreReviews', productCtrl.loadMoreReviews);

router.post('/createProductComments', productCtrl.createProductComments);
router.get('/loadMoreComments', productCtrl.loadMoreComments);
router.get('/SortPorductComments', productCtrl.SortPorductComments);
router.get('/:Slugs', productCtrl.index);



module.exports = router;