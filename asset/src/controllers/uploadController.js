
module.exports = {
    uploadImage(req, res) {
        if (!req.file) {
            return res.status(400).send('Vui lòng chọn một tệp ảnh để upload.');
        }
        const uploadedFilePath = '/uploads/images/' + req.uploadedFileName;

        return res.json({ uploadedFilePath });
    },
    uploadFile(req, res) {
        if (!req.file) {
            return res.status(400).send('Vui lòng chọn một tệp để upload.');
        }
        const uploadedFilePath = '/uploads/files/' + req.uploadedFileName;

        return res.json({ uploadedFilePath });
    },
    multiUploadImage(req, res) {
        if (!req.files) {
            return res.status(400).send('Vui lòng chọn một tệp ảnh để upload.');
        }
        const uploadedFilePath = '/uploads/images/' + req.uploadedFileName;

        return res.json({ uploadedFilePath });
    },
    multiUploadFile(req, res) {
        if (!req.files) {
            return res.status(400).send('Vui lòng chọn một tệp để upload.');
        }
        const uploadedFilePath = '/uploads/files/' + req.uploadedFileName;

        return res.json({ uploadedFilePath });
    },
}