const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');


// Định nghĩa storage cho tệp hình ảnh
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../', 'public', 'uploads', 'images'));
    },
    filename: async (req, file, cb) => {
        const originalName = file.originalname;
        const destination = path.join(__dirname, '../../', 'public', 'uploads', 'images');
        let newFilename = originalName;
        let fileIndex = 1;

        // Kiểm tra xem tệp có tồn tại hay không
        while (await fs.pathExists(path.join(destination, newFilename))) {
            const ext = path.extname(originalName);
            const nameWithoutExt = path.basename(originalName, ext);
            newFilename = `${nameWithoutExt}-${fileIndex}${ext}`;
            fileIndex++;
        }

        cb(null, newFilename);

        // Trả về tên tệp tin sau khi lưu
        req.uploadedFileName = newFilename;
    },
});

// Định nghĩa storage cho tệp tin
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../', 'public', 'uploads', 'files'));
    },
    filename: async (req, file, cb) => {
        const originalName = file.originalname;
        const destination = path.join(__dirname, '../../', 'public', 'uploads', 'files');
        let newFilename = originalName;
        let fileIndex = 1;

        // Kiểm tra xem tệp có tồn tại hay không
        while (await fs.pathExists(path.join(destination, newFilename))) {
            const ext = path.extname(originalName);
            const nameWithoutExt = path.basename(originalName, ext);
            newFilename = `${nameWithoutExt}-${fileIndex}${ext}`;
            fileIndex++;
        }

        cb(null, newFilename);

        // Trả về tên tệp tin sau khi lưu
        req.uploadedFileName = newFilename;
    },
});

// Tạo instances riêng biệt cho hình ảnh và tệp không phải hình ảnh
const imageUpload = multer({ storage: imageStorage });
const fileUpload = multer({ storage: fileStorage });

module.exports = {
    imageUpload,
    fileUpload,
};