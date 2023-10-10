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
            var sql = 'select * from product where status = "active" order by id desc'
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