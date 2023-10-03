const express = require('express');
const router = express.Router();
const { imageUpload, fileUpload } = require('../configs/uploadConfig');
const uploadController = require('../controllers/uploadController');

// Single
router.post('/image', imageUpload.single('file'), uploadController.uploadImage);
router.post('/file', fileUpload.single('file'), uploadController.uploadFile);

// Multer
router.post('/images', imageUpload.array('file', 10), uploadController.multiUploadImage);
router.post('/files', fileUpload.array('file', 10), uploadController.multiUploadFile);

module.exports = router;