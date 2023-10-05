const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');


router.get('/quan-ly-san-pham', userCtrl.productManager);
router.post('/quan-ly-san-pham/createProduct', userCtrl.create);
router.post('/quan-ly-san-pham/updateProduct', userCtrl.update);
router.post('/quan-ly-san-pham/getProductbyId', userCtrl.getProductById);


router.get('/:Id', userCtrl.index);

module.exports = router;