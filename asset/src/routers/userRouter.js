const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');


router.get('/quan-ly-san-pham', userCtrl.productManager);
router.post('/them-san-pham', userCtrl.create);

router.get('/:Id', userCtrl.index);

module.exports = router;