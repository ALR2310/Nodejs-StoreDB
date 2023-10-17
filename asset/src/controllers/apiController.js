const db = require('../configs/dbconnect')

function returnData(success = false, notice = 'Lấy dữ liệu thất bại', data = []) {
    const result = {
        success: success,
        notice: notice,
        data: data
    }
    return result
}

function ChangeToSlug(slug) {
    //Lấy text từ thẻ input title 
    slug = slug.toLowerCase();
    //Đổi ký tự có dấu thành không dấu
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    slug = slug.replace(/đ/gi, 'd');
    //Xóa các ký tự đặt biệt
    slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
    //Đổi khoảng trắng thành ký tự gạch ngang
    slug = slug.replace(/ /gi, "-");
    //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
    //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
    slug = slug.replace(/\-\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-/gi, '-');
    slug = slug.replace(/\-\-/gi, '-');
    // Thêm một chuỗi số ngẫu nhiên 4 số vào cuối slug
    var randomNumber = Math.floor(Math.random() * 10000); // Số ngẫu nhiên từ 0 đến 9999
    slug = slug + '-' + randomNumber;
    //Xóa các ký tự gạch ngang ở đầu và cuối
    slug = '@' + slug + '@';
    slug = slug.replace(/\@\-|\-\@|\@/gi, '');
    //In slug ra textbox có id “slug”
    return slug;
}

module.exports = {
    // Api lấy danh sách sản phẩm
    async getProduct(req, res) {
        const connection = await db
        try {
            // Lấy danh sách sản phẩm
            var sql = 'select * from product ';
            const [result] = await connection.execute(sql)

            // Kiểm tra xem có đièu kiện truy vấn không
            if (Object.keys(req.query).length > 0) {
                // nếu có điều kiện truy vấn
                const condition = req.query.condition;
                sql += condition;

                const [result] = await connection.execute(sql)
                if (result.length > 0) {
                    return res.json(returnData(true, 'Lấy dữ liệu thành công', result));
                }
            } else {
                // nếu không có điều kiện truy vấn, trả về đầy đủ danh sách
                if (result.length > 0) {
                    return res.json(returnData(true, 'Lấy dữ liệu thành công', result));
                }
            }
            return res.json(returnData());
        } catch (err) {
            console.log('Lỗi truy vấn:', err);
            returnData(false, 'Đã xảy ra lỗi trong quá trình thực hiện:' + err);
        }
    },

    // Api thêm một sản phẩm
    async addProduct(req, res) {
        const { UserId, CategoryId, Images, Productname, Quantity, Price } = req.body;
        const ProductSlugs = ChangeToSlug(Productname)

        const connection = await db;
        try {
            var sql = 'INSERT INTO product (UserId, CategoryId, Images, Productname, Quantity, Price, Slugs) VALUES (?, ?, ?, ?, ?, ?, ?)';
            var params = [UserId, CategoryId, Images, Productname, Quantity, Price, ProductSlugs];

            const [result] = await connection.execute(sql, params)

            if (result.affectedRows > 0) {
                return res.json(returnData(true, 'Thêm sản phẩm thành công'))
            } else {
                return res.json(returnData(false, 'Thêm sản phẩm thất bại'))
            }
        } catch (err) {
            console.log('Lỗi truy vấn:', err);
            returnData(false, 'Đã xảy ra lỗi trong quá trình thực hiện:' + err);
        }
    },

    // Api cập nhật sản phẩm
    async editProduct(req, res) {
        const { Id, UserId, CategoryId, Images, Productname, Quantity, Price, Status } = req.body;
        const ProductSlugs = ChangeToSlug(Productname);

        const connection = await db;
        try {
            var sql = 'UPDATE product SET ';
            var params = [];

            if (UserId !== undefined) { sql += 'UserId = ?, '; params.push(UserId); }
            if (CategoryId !== undefined) { sql += 'CategoryId = ?, '; params.push(CategoryId); }
            if (Images !== undefined) { sql += 'Images = ?, '; params.push(Images); }
            if (Productname !== undefined) { sql += 'Productname = ?, '; params.push(Productname); }
            if (Quantity !== undefined) { sql += 'Quantity = ?, '; params.push(Quantity); }
            if (Price !== undefined) { sql += 'Price = ?, '; params.push(Price); }
            if (ProductSlugs !== undefined) { sql += 'Slugs = ?, '; params.push(ProductSlugs); }
            if (Status !== undefined) { sql += 'Status = ?, '; params.push(Status); }

            // Loại bỏ dấu phẩy cuối cùng nếu có
            if (sql.endsWith(', ')) { sql = sql.slice(0, -2); }

            sql += ' WHERE Id = ?';
            params.push(Id);

            const [result] = await connection.execute(sql, params);

            if (result.affectedRows > 0) {
                return res.json(returnData(true, 'Chỉnh sửa sản phẩm thành công'));
            } else {
                return res.json(returnData(false, 'Chỉnh sửa sản phẩm thất bại'));
            }
        } catch (err) {
            console.log('Lỗi truy vấn:', err);
            returnData(false, 'Đã xảy ra lỗi trong quá trình thực hiện:' + err);
        }
    },

    // Api xóa sản phẩm
    async deleteProduct(req, res) {
        const { Id } = req.body;

        const connection = await db;
        try {
            if (Array.isArray(Id)) {
                // Nếu Id là một mảng, xoá nhiều sản phẩm
                const placeholders = Id.map(() => '?').join(',');
                var sql = `DELETE FROM product WHERE Id IN (${placeholders})`;
                const [result] = await connection.execute(sql, Id);

                if (result.affectedRows > 0) {
                    return res.json(returnData(true, 'Xóa sản phẩm thành công'));
                } else {
                    return res.json(returnData(false, 'Xóa sản phẩm thất bại'));
                }
            } else {
                // Nếu Id là một số, xoá một sản phẩm
                var sql = 'DELETE FROM product WHERE Id = ?';
                const [result] = await connection.execute(sql, [Id]);

                if (result.affectedRows > 0) {
                    return res.json(returnData(true, 'Xóa sản phẩm thành công'));
                } else {
                    return res.json(returnData(false, 'Xóa sản phẩm thất bại'));
                }
            }
        } catch (err) {
            console.log('Lỗi truy vấn:', err);
            returnData(false, 'Đã xảy ra lỗi trong quá trình thực hiện:' + err);
        }
    },

    // Api lấy danh sách người dùng
    async getUser(req, res) {
        const connection = await db
        try {
            var sql = 'select * from users as u inner join usersinfor as ui on u.Id = ui.UserId where u.status = "active" order by u.Id desc'
            const [rows] = await connection.execute(sql)
            if (rows.length > 0) {
                res.json(returnData(true, 'Lấy dữ liệu thành công', rows))
            } else {
                res.json(returnData())
            }
        } catch (err) {
            console.log('Lỗi truy vấn:', err);
            returnData(false, 'Đã xảy ra lỗi trong quá trình thực hiện:' + err);
        }
    },
}