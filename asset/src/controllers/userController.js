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

function loadUser(req, res) {
    var sql = 'select * from users inner join usersinfor on users.Id = usersinfor.Id where users.Id = ?';
    var params = [req.params.Id];

    db.query(sql, params, (err, result) => {
        if (err) { console.log('Lỗi truy vấn') }
        else {
            result[0].DateOfBirth = formatDate(result[0].DateOfBirth);
            result[0].AtCreate = formatDate(result[0].AtCreate);
            result[0].DateOfBirthInput = formatDateForInput(result[0].DateOfBirth);
            result[0].AtCreateInput = formatDateForInput(result[0].AtCreate);
            res.render('user/index', { user: result[0] });
        }
    })
}

module.exports = {
    // Mở trang Index
    index(req, res) {
        //Kiểm tra người dùng hiện tại
        var userId = req.params.Id;
        if (userId == res.locals.currentUser.Id) {
            loadUser(req, res);
        } else {
            res.render('page404', { layout: '404layout' });
        }
    },

    // Mở trang quản lý sản phẩm
    productManager(req, res) {
        db.query('select * from categories', (err, result) => {
            if (err) { console.log('Lỗi truy vấn') }
            else {
                res.render('user/product', { categories: result });
            }
        });
    },

    //Post upload sản phẩm
    // async create(req, res) {
    //     try {
    //         // Nhập dữ liệu từ client
    //         const { productName, price, image, category, quantity, description } = req.body;
    //         const currentUserId = res.locals.currentUser.Id;

    //         var sql = 'insert into product(UserId, CategoryId, Images, Productname, Quantity, Price) value (?, ?, ?, ?, ?, ?)';
    //         var params = [currentUserId, category, image, productName, quantity, price];
    //         const insertProduct = await db.query(sql, params);

    //         // Lấy Id sản phẩm
    //         const productId = insertProduct.insertId;

    //         sql = 'insert into ProductDesc(ProductId, Desccription) values(?, ?)';
    //         params = [productId, description];
    //         await db.query(sql, params);

    //         return res.json({ success: true });
    //     } catch (err) {
    //         console.log(err)
    //         return res.status(500).json({ success: false, error: 'Lỗi truy vấn cơ sở dữ liệu' });
    //     }
    // },

    create(req, res) {
        // Nhập dữ liệu từ client
        const { productName, price, image, category, quantity, description } = req.body;
        const currentUserId = res.locals.currentUser.Id;
        var sql = 'insert into product(UserId, CategoryId, Images, Productname, Quantity, Price) value (?, ?, ?, ?, ?, ?)';
        var params = [currentUserId, category, image, productName, quantity, price];

        db.query(sql, params, (err, result) => {
            if (err) { console.log('Lỗi truy vấn 1') }
            else {
                const productId = result.insertId;
                sql = 'insert into ProductDesc(ProductId, Description) values(?, ?)';
                params = [productId, description];

                db.query(sql, params, (err1, result1) => {
                    if (err1) { console.log('Lỗi truy vấn 2') }
                    else {
                        return res.json({ success: true });
                    }
                })
            }
        });
    }
}