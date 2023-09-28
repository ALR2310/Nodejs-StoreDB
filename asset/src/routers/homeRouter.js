const express = require('express')
const router = express.Router()
const homeCtrl = require('../controllers/homeController')

router.use(homeCtrl.authenticateUser)

router.get('/', homeCtrl.index);
router.post('/dang-nhap', homeCtrl.login);
router.post('/dang-ky', homeCtrl.register);
router.get('/create', homeCtrl.create);
router.post('/create', homeCtrl.createProduct);

module.exports = router