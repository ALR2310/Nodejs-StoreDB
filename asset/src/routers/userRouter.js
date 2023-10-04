const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');


router.get('/quan-ly-san-pham', userCtrl.productManager);
router.post('/createProduct', userCtrl.create);
router.post('/updateProduct', userCtrl.update);
router.post('/getProductById', userCtrl.getProductById);
router.get('/:Id', userCtrl.index);

module.exports = router;