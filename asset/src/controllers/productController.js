const db = require('../configs/dbconnect');

module.exports = {
    // Router:/san-pham/:slugs
    async index(req, res) {
        const ProductSlugs = req.params.Slugs;

        const connection = await db;
        try {
            // Lấy sản phẩm dựa trên slugsUrl
            var sql = 'select * from product as p inner join productdesc as pd on p.Id = pd.ProductId where p.slugs = ?';
            var params = [ProductSlugs];
            const [rows] = await connection.execute(sql, params);

            console.log(rows[0]);

            // Trả kết quả về view
            if (rows.length > 0) {
                res.render('product/index', { product: rows[0] });
            } else {
                res.render('page404', { layout: '404layout' });
            }
        } catch (err) {
            console.log('Lỗi truy vấn:', err);
        }
    }
}