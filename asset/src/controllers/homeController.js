const db = require('../configs/dbconnect')
const crypto = require('crypto'); // Sử dụng để tạo mã xác thực người dùng
const { v4: uuidv4 } = require('uuid'); // Sử dụng để tạo token

const mysql = require('mysql2/promise');

// function load sản phẩm
async function LoadProduct() {
    const connection = await db;
    try {
        const [result] = await connection.execute('select * from product');
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

    // Hàm sử lý chức năng đăng nhập
    async login(req, res) {
        const { email, password, remember } = req.body; // Nhận dữ liệu từ client gửi đến

        // khai báo kết nối
        const connection = await db;

        try {
            // Kiểm tra thông tin đăng nhập của người dùng trong cơ sở dữ liệu
            const sql = 'SELECT * FROM Users WHERE (UserName = ? OR Email = ?) AND Password = ?';
            const [result, fields] = await connection.execute(sql, [email, email, password]);

            if (result.length === 0) {
                return res.json({ loginResult: false });
            } else {
                // Tạo mã xác thực người dùng (token)
                const token = crypto.createHash('sha256').update(uuidv4()).digest('hex');
                const userId = result[0].Id; // Lấy Id người dùng

                // Lưu mã xác thực người dùng vào bảng authTokens
                const insertTokenSql = 'INSERT INTO authTokens (UserId, tokens) VALUES (?, ?)';
                await connection.execute(insertTokenSql, [userId, token]);

                if (remember) {
                    // Lưu mã xác thực vào cookie trong 1 tuần
                    res.cookie('authToken', token, { maxAge: 1000 * 60 * 60 * 24 * 7 });
                } else {
                    res.cookie('authToken', token); // Lưu mã xác thực vào cookie
                }

                return res.redirect('/');
            }
        } catch (error) {
            console.error('Lỗi truy vấn:', error);
            return res.status(500).json({ loginResult: false });
        }
    },

    // Hàm sử lý chức năng đăng ký
    async register(req, res) {
        const { email, username, password } = req.body; //Nhận dữ liệu từ client

        // khai báo kết nối
        const connection = await db;
        

        try {
            //Kiểm tra tên đăng nhập
            const userNameQuery = 'SELECT * FROM users WHERE UserName = ?';
            const userNameResult = await connection.execute(userNameQuery, [username]);

            if (userNameResult[0].length > 0) {
                return res.json({ userNameExist: true });
            }

            //Kiểm tra email
            const emailQuery = 'SELECT * FROM users WHERE Email = ?';
            const emailResult = await connection.execute(emailQuery, [email]);

            if (emailResult[0].length > 0) {
                return res.json({ emailExist: true });
            }

            // Tiến hành đăng ký
            const insertQuery = 'INSERT INTO Users (UserName, Password, Email, Avatar) VALUES (?, ?, ?, ?)';
            const defaultAvatar = '/images/defaultAvatar.jpg';

            await connection.execute(insertQuery, [username, password, email, defaultAvatar]);

            res.json({ register: true });
        } catch (error) {
            console.error('Lỗi truy vấn:', error);
            res.status(500).json({ register: false });
        }
    },

    // Một hàm middleware để xác thực người dùng trong mọi yêu cầu
    async authenticateUser(req, res, next) {
        const authToken = req.cookies.authToken; // Lấy mã xác thực từ cookie

        // khai báo kết nối
        const connection = await db;

        if (!authToken) {
            // Nếu auth token không được định nghĩa, hãy bỏ qua truy vấn
            return next();
        }

        try {
            // Kiểm tra mã xác thực với cơ sở dữ liệu hoặc nơi bạn lưu nó
            const sql = 'SELECT * FROM authTokens WHERE tokens = ?';
            const [result, fields] = await connection.execute(sql, [authToken]);

            if (result.length === 0) {
                console.log('NotAuthToken');
                next();
            } else {
                // Lấy thông tin người dùng từ cơ sở dữ liệu bằng userId
                const userId = result[0].UserId;
                const userQuery = 'SELECT * FROM Users WHERE Id = ?';
                const [userResult, userFields] = await connection.execute(userQuery, [userId]);

                if (userResult.length === 0) {
                    return res.status(401).send('NotUser');
                } else {
                    res.locals.currentUser = userResult[0];
                    next(); // Chuyển tiếp yêu cầu
                }
            }
        } catch (error) {
            console.error('Lỗi truy vấn:', error);
            next();
        }
    }
}