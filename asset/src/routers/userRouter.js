const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const authCtrl = require('../controllers/authController');

router.use(authCtrl.checkCurrentUser);

router.get('/quan-ly-san-pham', userCtrl.productManager);
router.post('/quan-ly-san-pham/createProduct', userCtrl.create);
router.post('/quan-ly-san-pham/updateProduct', userCtrl.update);
router.post('/quan-ly-san-pham/getProductbyId', userCtrl.getProductById);
router.post('/quan-ly-san-pham/deleteProduct', userCtrl.delete);

router.post('/updateUser', userCtrl.updateUser);
router.post('/updateAvatarUser', userCtrl.updateAvatarUser);
router.post('/updaePasswordUser', userCtrl.updaePasswordUser);

router.get('/:Id', userCtrl.index);

module.exports = router;