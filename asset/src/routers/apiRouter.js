const express = require('express')
const router = express.Router()
const apiCtrl = require('../controllers/apiController')

router.get('/getProduct', apiCtrl.getProduct)
router.post('/addProduct', apiCtrl.addProduct)
router.patch('/editProduct', apiCtrl.editProduct)
router.delete('/deleteProduct', apiCtrl.deleteProduct)

router.get('/getUser', apiCtrl.getUser)

module.exports = router
