const db = require('../configs/dbconnect')
const crypto = require('crypto'); // Sử dụng để tạo mã xác thực người dùng
const { v4: uuidv4 } = require('uuid'); // Sử dụng để tạo token

module.exports = {
    // xử lý chức năng đăng nhập bằng google
    async loginGoogle(req, res) {
        // Truy cập thông tin người dùng thông qua req.user
        const user = req.user;
        var googleId = user.id;
        var displayName = user.displayName;
        var email = user.emails[0].value;
        var avatar = user.photos[0].value;

        const connection = await db;
        try {
            var sql = 'select * from users where GoogleId = ?';
            const [rows] = await connection.execute(sql, [googleId]);

            // Tài khoản tồn tại
            if (rows.length > 0) {
                var token;
                const userId = rows[0].Id; // Lấy id người dùng
                // Lấy mã xác thực của người dùng (token)
                sql = 'select tokens from authtokens where userid = ?';
                const [rowsTokens] = await connection.execute(sql, [userId]);

                // Kiểm tra mã xác thực (token)
                if (rowsTokens.length > 0) {
                    // nếu có mã xác thực
                    token = rowsTokens[0].tokens;
                } else {
                    // nếu không có mã xác thực
                    // Luu mã xác thực người dùng vào bảng authTokens
                    token = crypto.createHash('sha256').update(uuidv4()).digest('hex');
                    sql = 'INSERT INTO authTokens (UserId, tokens) VALUES (?, ?)';
                    await connection.execute(sql, [userId, token]);
                };

                res.cookie('authToken', token); // Luu mã xác thực vào cookie
            } else {
                // Tài khoản không tồn tại, tiến hành dang ký
                sql = 'INSERT INTO Users (GoogleId, UserName, Email, Avatar) VALUES (?, ?, ?, ?)';
                var params = [googleId, displayName, email, avatar];
                const [users] = await connection.execute(sql, params);

                // Lấy id người dùng
                const userId = users.insertId;

                // Thêm vào userinfor
                sql = 'insert usersinfor(userid, displayname) value (?, ?)'
                params = [userId, displayName];
                await connection.execute(sql, params);

                // Tạo mã xác thực người dùng (token)
                const token = crypto.createHash('sha256').update(uuidv4()).digest('hex');
                sql = 'INSERT INTO authTokens (UserId, tokens) VALUES (?, ?)';
                await connection.execute(sql, [userId, token]);

                res.cookie('authToken', token); // Luu mã xác thực vào cookie
            }
            // đóng cửa sổ đăng nhập, reload lại trang web chính
            res.send('<script>window.opener.location.reload(); window.close();</script>');
        } catch (err) {
            console.log('Lỗi truy vấn:', err);
        }
    },

    // Hàm xử lý chức năng đăng nhập
    async login(req, res) {
        const { email, password, remember } = req.body; // Nhận dữ liệu từ client gửi đến

        // khai báo kết nối
        const connection = await db;
        try {
            // Kiểm tra thông tin đăng nhập của người dùng trong cơ sở dữ liệu
            var sql = 'SELECT * FROM Users WHERE (UserName = ? OR Email = ?) AND Password = ?';
            const [result] = await connection.execute(sql, [email, email, password]);

            if (result.length === 0) {
                return res.json({ loginResult: false });
            } else {
                var token;
                const userId = result[0].Id; // Lấy Id người dùng

                // Kiểm tra mã xác thực của người dùng (token)
                sql = 'select tokens from authtokens where userid = ?';
                const [rowsTokens] = await connection.execute(sql, [userId]);

                if (rowsTokens.length > 0) {
                    // nếu có mã xác thực
                    token = rowsTokens[0].tokens;
                } else {
                    // nếu không có mã xác thực, tạo mã xác thực mới
                    token = crypto.createHash('sha256').update(uuidv4()).digest('hex');
                    sql = 'INSERT INTO authTokens (UserId, tokens) VALUES (?, ?)';
                    await connection.execute(sql, [userId, token]);
                }

                if (remember) {
                    // Lưu mã xác thực vào cookie trong 1 tuần
                    res.cookie('authToken', token, { maxAge: 1000 * 60 * 60 * 24 * 7 });
                } else {
                    res.cookie('authToken', token); // Lưu mã xác thực vào cookie
                }

                return res.json({ loginResult: true });
            }
        } catch (error) {
            console.error('Lỗi truy vấn:', error);
            return res.status(500).json({ loginResult: false });
        }
    },

    // Hàm xử lý chức năng đăng ký
    async register(req, res) {
        const { email, username, password } = req.body; //Nhận dữ liệu từ client

        // khai báo kết nối
        const connection = await db;
        try {
            //Kiểm tra tên đăng nhập
            var sql = 'SELECT * FROM users WHERE UserName = ?';
            const userNameResult = await connection.execute(sql, [username]);
            if (userNameResult[0].length > 0) {
                return res.json({ userNameExist: true });
            }

            //Kiểm tra email
            sql = 'SELECT * FROM users WHERE Email = ?';
            const emailResult = await connection.execute(sql, [email]);
            if (emailResult[0].length > 0) {
                return res.json({ emailExist: true });
            }

            // Tiến hành đăng ký
            const defaultAvatar = '/images/defaultAvatar.jpg';
            sql = 'INSERT INTO Users (UserName, Password, Email, Avatar) VALUES (?, ?, ?, ?)';
            const [insertUserResult] = await connection.execute(sql, [username, password, email, defaultAvatar]);

            const userId = insertUserResult.insertId;
            // Thêm thông tin chi tiết
            sql = 'insert usersinfor(userid, displayname, gender) value (?, ?, ?)'
            await connection.execute(sql, [userId, username, 'Nam']);

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
                const userQuery = 'select * from users as u inner join usersinfor as ui on ui.UserId = u.Id where ui.userid = ?';
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
    },

    // Một Middleware Kiểm tra xem có thông tin người dùng hiện tại không
    async checkCurrentUser(req, res, next) {
        var UserId = res.locals.currentUser;
        if (UserId) {
            next();
        } else {
            res.render('page404', { layout: '404layout' });
        }
    },
}