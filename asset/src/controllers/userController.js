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
        const sql = 'select * from users as u inner join usersinfor as ui on ui.UserId = u.Id where ui.UserId = ?';
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
        if (userId == res.locals.currentUser.UserId) {
            res.render('user/index', { user: userInfor });
        } else {
            res.render('page404', { layout: '404layout' });
        }
    },

    async updateUser(req, res) {
        const currentUserId = res.locals.currentUser.UserId;
        const { DisplayName, PhoneNumber, DateOfBirth, Address, Gender } = req.body;

        const connection = await db;
        try {
            // Cật nhật thông tin người dùng
            var sql = 'update usersinfor set DisplayName = ?, PhoneNumber = ?, Gender = ?, DateOfBirth = ?, Address = ? where Id = ?';
            var params = [DisplayName, PhoneNumber, Gender, DateOfBirth, Address, currentUserId];
            await connection.execute(sql, params);

            res.json({ success: true });
        } catch (err) {
            console.log('Lỗi truy vấn:', err);
        }
    },

    async updateAvatarUser(req, res) {
        const currentUserId = res.locals.currentUser.UserId;
        const { Avatar } = req.body;

        const connection = await db;
        try {
            // cập nhật avatar người dùng
            var sql = 'update users set Avatar = ? where Id = ?';
            var params = [Avatar, currentUserId];
            await connection.execute(sql, params);

            res.json({ success: true });
        } catch (err) {
            console.log('Lỗi truy vấn:', err);
        }
    },

    async updaePasswordUser(req, res) {
        const currentUserId = res.locals.currentUser.UserId;
        const { OldPassword, NewPassword } = req.body;

        const connection = await db;
        try {
            // Kiểm tra mật khẩu hiện tại
            var sql = 'select * from users where Id = ? and Password = ?';
            var params = [currentUserId, OldPassword];
            const [rows] = await connection.execute(sql, params);

            if (rows.length > 0) {
                // cập nhật mật khẩu người dùng
                sql = 'update users set Password = ? where Id = ?';
                params = [NewPassword, currentUserId];
                await connection.execute(sql, params);

                res.json({ success: true, notExist: false });
            } else {
                res.json({ success: false, notExist: true });
            }
        } catch (err) {
            console.log('Lỗi truy vấn:', err);
        }
    },

    // Router:/nguoi-dung/quan-ly-san-pham
    // Mở trang quản lý sản phẩm
    async productManager(req, res) {
        const keysearch = req.query.timkiem;

        let sql, params;

        if (keysearch && keysearch !== '') {
            sql = 'SELECT * FROM product WHERE UserId = ? AND (Productname LIKE ? OR Quantity LIKE ? OR Price LIKE ?)';
            params = [res.locals.currentUser.UserId, `%${keysearch}%`, `%${keysearch}%`, `%${keysearch}%`];
        } else {
            sql = 'SELECT * FROM product WHERE UserId = ?';
            params = [res.locals.currentUser.UserId];
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

        sql = 'select tagname from tag where ProductId = ?';
        const [listTags] = await connection.execute(sql, params);

        var tagsArray = [];
        if (listTags) {
            // Trích xuất các tên tags thành mảng
            tagsArray = listTags.map(tag => tag.tagname);
        }

        if (result) {
            res.json({ product: result[0], tags: tagsArray });
        }
    },

    //xử lý create sản phẩm
    async create(req, res) {
        const connection = await db; //Khai báo kết nối
        try {
            // Nhập dữ liệu từ client
            const { productName, price, image, category, quantity, description, tags } = req.body;
            const currentUserId = res.locals.currentUser.UserId;

            //Thêm sản phẩm
            var sql = 'INSERT INTO product(UserId, CategoryId, Images, Productname, Quantity, Price) VALUES (?, ?, ?, ?, ?, ?)';
            var params = [currentUserId, category, image, productName, quantity, price];
            const [productResult] = await connection.execute(sql, params);

            // Lấy Id sản phẩm vừa thêm
            const productId = productResult.insertId;

            // Thêm mô tả sản phẩm
            sql = 'INSERT INTO ProductDesc(ProductId, Description) VALUES (?, ?)';
            params = [productId, description];
            await connection.execute(sql, params);

            // Thêm các thẻ tags tìm kiếm
            // Lặp qua mảng tags và thêm từng tag vào bảng
            for (const tag of tags) {
                sql = 'insert tag(productid, TagName) value(?, ?)';
                params = [productId, tag];

                const [tagsResult] = await connection.execute(sql, params);
                if (!tagsResult) {
                    console.log(`Không thể thêm tag: ${tag}`);
                }
            }
            // Trả về kết quả cho client
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
            const { Id, Productname, Price, CategoryId, Quantity, Description, tags } = req.body;

            // Cập nhật sản phẩm
            var query = 'UPDATE product SET CategoryId = ?, Productname = ?, Quantity = ?, Price = ? WHERE Id = ?';
            var params = [CategoryId, Productname, Quantity, Price, Id];
            await connection.execute(query, params);

            // Cập nhật mô tả sản phẩm
            query = 'UPDATE productdesc SET Description = ? WHERE ProductId = ?';
            params = [Description, Id];
            await connection.execute(query, params);

            // Cập nhật các tags
            // Lấy danh sách tags hiện tại của sản phẩm
            query = 'SELECT TagName FROM Tag WHERE ProductId = ?';
            const [currentTagsResult] = await connection.execute(query, [Id]);
            const currentTags = currentTagsResult.map(tag => tag.TagName);

            // Lặp qua danh sách tags mới và thêm những tag mới
            for (const tag of tags) {
                if (!currentTags.includes(tag)) {
                    query = 'INSERT INTO Tag(ProductId, TagName) VALUES (?, ?)';
                    await connection.execute(query, [Id, tag]);
                }
            }
            // Xóa các tags không còn trong danh sách tags mới
            for (const currentTag of currentTags) {
                if (!tags.includes(currentTag)) {
                    query = 'DELETE FROM Tag WHERE ProductId = ? AND TagName = ?';
                    await connection.execute(query, [Id, currentTag]);
                }
            }

            // Trả thông báo về clinet
            return res.json({ success: true });
        } catch (error) {
            console.log('Lỗi truy vấn:', error);
            return res.json({ success: false, error: 'Lỗi truy vấn' });
        }
    },
}