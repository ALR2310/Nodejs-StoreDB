const express = require('express')
const router = express.Router()
const homeCtrl = require('../controllers/homeController')
const authCtrl = require('../controllers/authController')

router.use(authCtrl.authenticateUser);

router.get('/', homeCtrl.index);
router.get('/chat', homeCtrl.chat);
router.post('/chat/addMessage', homeCtrl.addMessage);

module.exports = router