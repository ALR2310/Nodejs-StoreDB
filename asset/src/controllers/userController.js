const db = require('../configs/dbconnect');

// Định dạng lại ngày tháng năm
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
// Định dạng ngày thành year/month/day
function formatDateForInput(dateStr) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
        const [month, day, year] = parts;
        return `${year}-${day}-${month}`;
    }
    return dateStr; // Trả về nguyên bản nếu không thể chuyển đổi
}

async function loadUser(req) {
    const connection = await db; //Khai báo kết nối
    try {
        const sql = 'SELECT * FROM users INNER JOIN usersinfor ON users.Id = usersinfor.Id WHERE users.Id = ?';
        const params = [req.params.Id];

        const [rows] = await connection.execute(sql, params);

        if (rows.length > 0) {
            const result = rows[0];
            result.DateOfBirth = formatDate(result.DateOfBirth);
            result.AtCreate = formatDate(result.AtCreate);
            result.DateOfBirthInput = formatDateForInput(result.DateOfBirth);
            result.AtCreateInput = formatDateForInput(result.AtCreate);

            return result;
        } else {
            console.log('Không tìm thấy người dùng');
        }
    } catch (error) {
        console.log('Lỗi truy vấn:', error);
    }
}

module.exports = {
    // Router:/nguoi-dung/:Id
    // mở trang index
    async index(req, res) {
        const userInfor = await loadUser(req);

        //Kiểm tra người dùng hiện tại
        var userId = req.params.Id;
        if (userId == res.locals.currentUser.Id) {
            res.render('user/index', { user: userInfor });
        } else {
            res.render('page404', { layout: '404layout' });
        }
    },

    // Router:/nguoi-dung/quan-ly-san-pham
    // Mở trang quản lý sản phẩm
    async productManager(req, res) {
        const keysearch = req.query.timkiem;

        let sql, params;

        if (keysearch && keysearch !== '') {
            sql = 'SELECT * FROM product WHERE UserId = ? AND (Productname LIKE ? OR Quantity LIKE ? OR Price LIKE ?)';
            params = [res.locals.currentUser.Id, `%${keysearch}%`, `%${keysearch}%`, `%${keysearch}%`];
        } else {
            sql = 'SELECT * FROM product WHERE UserId = ?';
            params = [res.locals.currentUser.Id];
        }

        try {
            const connection = await db;
            const [result] = await connection.execute(sql, params);

            const [category] = await connection.execute('SELECT * FROM categories');

            res.render('user/product', { product: result, category });
        } catch (error) {
            console.log('Lỗi truy vấn:', error);
        }
    },

    //Lấy dữ liệu sản phẩm dựa trên Id
    async getProductById(req, res) {
        const { Id } = req.body;
        var sql = 'select product.*, productdesc.Description from product inner join productDesc on product.Id = productDesc.ProductId where product.Id = ?';
        var params = [Id]

        const connection = await db;
        const [result] = await connection.execute(sql, params);

        if (result) {
            res.json(result[0]);
        }
    },

    //xử lý create sản phẩm
    async create(req, res) {
        try {
            // Nhập dữ liệu từ client
            const { productName, price, image, category, quantity, description } = req.body;
            const currentUserId = res.locals.currentUser.Id;

            const insertProductQuery = 'INSERT INTO product(UserId, CategoryId, Images, Productname, Quantity, Price) VALUES (?, ?, ?, ?, ?, ?)';
            const productParams = [currentUserId, category, image, productName, quantity, price];

            const connection = await db;
            const [productResult] = await connection.execute(insertProductQuery, productParams);

            const productId = productResult.insertId;

            const insertProductDescQuery = 'INSERT INTO ProductDesc(ProductId, Description) VALUES (?, ?)';
            const productDescParams = [productId, description];

            await connection.execute(insertProductDescQuery, productDescParams);

            return res.json({ success: true });
        } catch (error) {
            console.log('Lỗi truy vấn:', error);
            return res.json({ success: false, error: 'Lỗi truy vấn' });
        }
    },

    //xử lý update sản phẩm
    async update(req, res) {
        const connection = await db; //Khai báo kết nối
        try {
            const { Id, Productname, Price, CategoryId, Quantity, Description } = req.body;

            var query = 'UPDATE product SET CategoryId = ?, Productname = ?, Quantity = ?, Price = ? WHERE Id = ?';
            var params = [CategoryId, Productname, Quantity, Price, Id];
            await connection.execute(query, params);

            query = 'UPDATE productdesc SET Description = ? WHERE ProductId = ?';
            params = [Description, Id];
            await connection.execute(query, params);

            console.log('Cập nhật thành công');
            return res.json({ success: true });
        } catch (error) {
            console.log('Lỗi truy vấn:', error);
            return res.json({ success: false, error: 'Lỗi truy vấn' });
        }
    }


}