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
    // Router:/nguoi-dung/:Id
    // mở trang index
    index(req, res) {
        //Kiểm tra người dùng hiện tại
        var userId = req.params.Id;
        if (userId == res.locals.currentUser.Id) {
            loadUser(req, res);
        } else {
            res.render('page404', { layout: '404layout' });
        }
    },



    // Router:/nguoi-dung/quan-ly-san-pham
    // Mở trang quản lý sản phẩm
    productManager(req, res) {
        const keysearch = req.query.timkiem;
        console.log(keysearch);
        var sql, params;

        if (keysearch != '' && keysearch != null || keysearch != undefined) {
            sql = 'SELECT * FROM product WHERE UserId = ? and (Productname LIKE ? OR Quantity LIKE ? OR Price LIKE ?)';
            params = [res.locals.currentUser.Id, `%${keysearch}%`, `%${keysearch}%`, `%${keysearch}%`];
            //Tìm kiếm sản phẩm
            db.query(sql, params, (err, result) => {
                if (err) { console.log('Lỗi truy vấn') }
                else {
                    //Lấy danh sách categories
                    db.query('select * from categories', (err1, result1) => {
                        if (err1) { console.log('Lỗi truy vấn 1') }
                        else {
                            res.render('user/product', { product: result, category: result1 });
                        }
                    });
                }
            })
        } else {
            db.query('select * from product where UserId = ?', [res.locals.currentUser.Id], (err, result) => {
                if (err) { console.log('Lỗi truy vấn') }
                else {

                    db.query('select * from categories', (err1, result1) => {
                        if (err1) { console.log('Lỗi truy vấn 1') }
                        else {
                            res.render('user/product', { product: result, category: result1 });
                        }
                    });
                }
            });
        }
    },

    //Lấy dữ liệu sản phẩm dựa trên Id
    getProductById(req, res) {
        const { Id } = req.body;
        var sql = 'select product.*, productdesc.Description from product inner join productDesc on product.Id = productDesc.ProductId where product.Id = ?';
        var params = [Id]

        db.query(sql, params, (err, result) => {
            if (err) { console.log('Lỗi truy vấn') }
            else {
                res.json(result[0]); //trả về dữ liệu sản phẩm
            }
        })
    },

    //xử lý create sản phẩm
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
    },

    //xử lý update sản phẩm
    update(req, res) {
        const { Id, Productname, Price, CategoryId, Quantity, Description } = req.body;
        var sql = 'update product set categoryId = ?, productname = ?, quantity = ?, price = ? where id = ?';
        var params = [CategoryId, Productname, Quantity, Price, Id];

        db.query(sql, params, (err, result) => {
            console.log(result);
            if (err) { console.log('Lỗi truy vấn') }
            else {
                // cập nhật tiếp cho bảng productDescription
                sql = 'update productdesc set Description = ? where ProductId = ?';
                params = [Description, Id];

                db.query(sql, params, (err1, result1) => {
                    if (err1) { console.log('Lỗi truy vấn') }
                    else {
                        console.log('cập nhật thành công');
                        return res.json({ success: true });
                    }
                })
            }
        })
    },


}