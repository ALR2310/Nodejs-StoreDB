const db = require('../configs/dbconnect')

function returnData(success = false, notice = 'Lấy dữ liệu thất bại', data = []) {
    const result = {
        success: success,
        notice: notice,
        data: data
    }
    return result
}

module.exports = {
    async getProduct(req, res) {


        const connection = await db
        try {
            // nhận điều kiện truy vấn
            const condition = req.query;

            // Lấy danh sách sản phẩm
            var sql = 'select * from product order by id desc';
            const [result, field] = await connection.execute(sql)
            // Lấy danh sách tên cột
            const columnNames = field.map(field => field.name);

            if (Object.keys(condition).length > 0) {
                // nếu có điều kiện truy vấn
                var column = condition.col;
                var value = parseInt(condition.val);

                // Kiểm tra giá trị đầu vào
                if (!columnNames.includes(column)) {
                    return res.json(returnData(false, 'Tên col không tồn tại trong bảng'));
                }

                var sql = `select * from product where ${column} = ? order by id desc`;
                const [rows, Fields] = await connection.execute(sql, [value]);

                if (rows.length > 0) {
                    return res.json(returnData(true, 'Lấy dữ liệu thành công', rows));
                }
            } else {
                // nếu không có điều kiện truy vấn, trả về đầy đủ danh sách
                if (result.length > 0) {
                    return res.json(returnData(true, 'Lấy dữ liệu thành công', result));
                }
            }
            return res.json(returnData());
        } catch (err) {
            console.log('Lỗi truy vấn:', err)
        }
    },

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
            console.log('Lỗi truy vấn:', err)
        }
    },
}