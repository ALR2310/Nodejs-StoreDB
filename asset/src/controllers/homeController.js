const db = require('../configs/dbconnect');
const WebSocket = require('ws');

// // Khởi tạo máy chủ WebSocket
// const wss = new WebSocket.Server({ port: process.env.WS_PORT });

// // Xử lý kết nối từ client
// wss.on('connection', (ws) => {
//     console.log('Client connected.');

//     // Lắng nghe tin nhắn từ client
//     ws.on('message', async (message) => {
//         console.log(`Nhận được tin nhắn: ${message}`);

//         // Xử lý tin nhắn ở đây (ví dụ: lưu vào cơ sở dữ liệu)
//         const connection = await db;
//         try {

//             var sql = 'insert Message(MessageText) value(?)'
//             var params = [message];

//             await connection.execute(sql, params);
//         } catch (err) {
//             console.log('Lỗi truy vấn: ' + err);
//         }
//         // Gửi tin nhắn lại cho client
//         ws.send(`Bạn đã gửi: ${message}`);
//     });

//     // Xử lý đóng kết nối
//     ws.on('close', () => {
//         console.log('Client disconnected.');
//     });
// });

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

    async chat(req, res) {
        const connection = await db;
        try {
            var sql = 'select * from Message';
            const [result] = await connection.execute(sql);
            res.render('home/chat', { messages: result });
        } catch (err) {
            console.log('Lỗi truy vấn: ' + err);
        }
    },

    async addMessage(req, res) {
        const { message } = req.body; // Nhận dữ liệu từ client

        const connection = await db;
        try {
            var currentUserId = res.locals.currentUser.UserId;

            var sql = 'insert Message(UserId, MessageText) value(?, ?)'
            var params = [currentUserId, message];

            await connection.execute(sql, params);

            return res.json({ success: true });
        } catch (err) {
            console.log('Lỗi truy vấn: ' + err);
        }
    },
}