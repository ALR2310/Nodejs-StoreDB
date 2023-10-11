const db = require('../configs/dbconnect')

// function load sản phẩm
async function LoadProduct() {
    const connection = await db;
    try {
        const [result] = await connection.execute('select * from product where Status = "Active" order by Id desc');
        return result;
    } catch (err) {
        console.log('Lỗi kết nối đến CSDL: ' + err)
    }
}

module.exports = {
    //Mở trang index
    async index(req, res) {
        const listProduct = await LoadProduct();
        res.render('home/index', { products: listProduct });
    },
}