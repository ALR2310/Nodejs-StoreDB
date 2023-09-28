const db = require('../configs/dbconnect')
const crypto = require('crypto'); // Sử dụng để tạo mã xác thực người dùng
const { v4: uuidv4 } = require('uuid'); // Sử dụng để tạo token

// function load sản phẩm
function LoadProduct(res) {
    var sql = 'select * from product'
    db.query(sql, (err, result) => {
        if (err) { console.log('Lỗi truy vấn') }
        else {
            res.render('home/index', { products: result })
        }
    })
}

module.exports = {
    //Mở trang index
    index(req, res) {
        LoadProduct(res);
    },

    // Hàm sử lý chức năng đăng nhập
    login(req, res) {
        const { email, password, remember } = req.body; // Nhận dữ liệu từ client gửi đến

        // Kiểm tra thông tin đăng nhập của người dùng trong cơ sở dữ liệu
        var sql = 'SELECT * FROM Users WHERE (UserName = ? OR Email = ?) AND Password = ?';
        var params = [email, email, password];

        db.query(sql, params, (err, result) => {
            if (result.length === 0) {
                return res.json({ loginResult: false });
            } else {
                // Tạo mã xác thực người dùng (token)
                const token = crypto.createHash('sha256').update(uuidv4()).digest('hex');
                const userId = result[0].Id; //lấy Id người dùng

                //Lưu mã xác thực người dùng vào bảng authTokens
                sql = 'INSERT INTO authTokens (UserId, tokens) VALUES (?, ?)';
                params = [userId, token];

                db.query(sql, params, (tokenErr) => {
                    if (tokenErr) {
                        console.log('Lỗi trong quá trình tạo mã xác thực người dùng');
                    } else {
                        if (remember) {
                            // Lưu mã xác thực vào cookie trong 1 tuần
                            res.cookie('authToken', token, { maxAge: 1000 * 60 * 60 * 24 * 7 });
                            return res.redirect('/');
                        } else {
                            res.cookie('authToken', token); // Lưu mã xác thực vào cookie
                            return res.redirect('/');   //chuyển hướng về trang chủ
                        }
                    }
                });
            }
        });
    },

    // Hàm sử lý chức năng đăng ký
    register(req, res) {
        const { email, username, password } = req.body; //Nhận dữ liệu từ client

        var userNameExist, emailExist;
        var sql = 'select * from users where UserName = ?'
        var params = [username];
        //Kiểm tra tên đăng nhập
        db.query(sql, params, (err, result) => {
            if (result.length > 0) {
                return res.json({ userNameExist: true });
            } else {
                userNameExist = false;
                //Kiểm tra email
                sql = 'select * from users where email = ?'
                params = [email];

                db.query(sql, params, (err, result) => {
                    if (result.length > 0) {
                        return res.json({ emailExist: true });
                    } else {
                        emailExist = false;
                        //Tiến hành đăng ký
                        if (userNameExist == false && emailExist == false) {
                            sql = 'INSERT INTO Users (UserName, Password, Email, Avatar) VALUES (?, ?, ?, ?)';
                            var defaultAvatar = '/images/defaultAvatar.jpg';
                            params = [username, password, email, defaultAvatar];

                            db.query(sql, params, (err, result) => {
                                if (err) {
                                    console.log('Lỗi truy vấn');
                                    res.status(500).json({ register: false });
                                } else {
                                    res.json({ register: true });
                                }
                            })
                        }
                    }
                });
            }
        });
    },

    // Một hàm middleware để xác thực người dùng trong mọi yêu cầu
    authenticateUser(req, res, next) {
        const authToken = req.cookies.authToken; // Lấy mã xác thực từ cookie (hoặc từ nơi bạn đã lưu nó)

        // Kiểm tra mã xác thực với cơ sở dữ liệu hoặc nơi bạn lưu nó
        var sql = 'SELECT * FROM authTokens WHERE tokens = ?';
        var params = [authToken];

        db.query(sql, params, (err, result) => {
            if (err || result.length === 0) {
                console.log('NotAuthToken');
                next();
            } else {
                // Lấy thông tin người dùng từ cơ sở dữ liệu bằng userId
                const userId = result[0].UserId;
                sql = 'SELECT * FROM Users WHERE Id = ?';

                db.query(sql, [userId], (userErr, userResult) => {
                    if (userErr || userResult.length === 0) {
                        return res.status(401).send('NotUser');
                    } else {
                        res.locals.currentUser = userResult[0];
                        next(); // Chuyển tiếp yêu cầu
                    }
                });
            }
        });
    },
}