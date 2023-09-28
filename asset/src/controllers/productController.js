const db = require('../configs/dbconnect');

module.exports = {
    index(req, res) {
        res.render('product/index');
    }
}