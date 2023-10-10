const express = require('express')
const router = express.Router()
const apiCtrl = require('../controllers/apiController')

router.get('/getProduct', apiCtrl.getProduct)
router.get('/getUser', apiCtrl.getUser)

module.exports = router
