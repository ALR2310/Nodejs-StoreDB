const db = require('../configs/dbconnect')
const crypto = require('crypto'); // Sử dụng để tạo mã xác thực người dùng
const { v4: uuidv4 } = require('uuid'); // Sử dụng để tạo token
const transporter = require('../configs/emailConfigs');


// function tạo 6 số ngẫu nhiên
function generateVerificationCode() {
    // Tạo một mảng gồm 6 số ngẫu nhiên từ 0 đến 9
    const numbers = Array.from({ length: 6 }, (_, i) => Math.floor(Math.random() * 10));
    // Trả về mảng số ngẫu nhiên
    return numbers.join("");
}

// Gửi mã xác thực
function sendVerificationEmail(email, verifyCode) {
    var mailOptions = {
        from: "ansaka147@gmail.com",
        to: email,
        subject: "Verification Code",
        text: `Mã xác thực ứng dụng của bạn là: ${verifyCode}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
};

async function generateAuthToken(userId, res) {
    const connection = await db;
    var token;
    var sql = 'select tokens from authtokens where userid = ?'
    try {
        const [checkTokens] = await connection.execute(sql, [userId]);

        if (checkTokens.length > 0) {
            // nếu có mã xác thực
            token = checkTokens[0].tokens; //gán mã xác thực vào biến
        } else {
            // nếu không có mã xác thực, tạo mới và thêm vào database
            token = crypto.createHash('sha256').update(uuidv4()).digest('hex');
            sql = 'INSERT INTO authTokens (UserId, tokens) VALUES (?, ?)';
            await connection.execute(sql, [userId, token]);
        }
        res.cookie('authToken', token); // Luu mã xác thực vào cookie
    } catch (err) {
        console.log('Lỗi truy vấn:', err);
    }
}

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
            // Kiểm tra email
            var sql = 'select * from users where Email = ?';
            const [checkEmail] = await connection.execute(sql, [email]);

            if (checkEmail.length > 0) {
                // email có tồn tại, kiểm tra GoogleId
                sql = 'select * from users where GoogleId = ? and Email = ?';
                const [checkGoogleId] = await connection.execute(sql, [googleId, email]);

                if (checkGoogleId.length > 0) {
                    // nếu có googleId, tiến hành đăng nhập
                    const userId = checkEmail[0].Id; // Lấy id người dùng

                    //Kiểm tra xem đã có mã xác thực chưa(authToken)
                    await generateAuthToken(userId, res); // Thêm mã xác thực vào cookie
                } else {
                    // nếu không có googleId, thêm googleId vào tài khoản
                    const userId = checkEmail[0].Id; // Lấy id người dùng
                    sql = 'update users set GoogleId = ? where Id = ?';
                    await connection.execute(sql, [googleId, userId]);

                    // kiểm tra xem đã có mã xác thực chưa(authToken)
                    await generateAuthToken(userId, res); // Thêm mã xác thực vào cookie
                }
            } else {
                // email không tồn tại, tiến hành đăng ký tài khoản mới
                sql = 'INSERT INTO Users (GoogleId, UserName, Email, Avatar, Status) VALUES (?, ?, ?, ?, ?)';
                var params = [googleId, displayName, email, avatar, 'Active'];
                const [insertUserResult] = await connection.execute(sql, params);

                const userId = insertUserResult.insertId; // lấy Id người dùng

                // Thêm vào userinfor
                sql = 'insert usersinfor(userid, displayname) value (?, ?)'
                params = [userId, displayName];
                await connection.execute(sql, params);

                // kiểm tra xem đã có mã xác thực chưa(authToken)
                await generateAuthToken(userId, res); // Thêm mã xác thực vào cookie
            }
            // đóng cửa sổ đăng nhập, reload lại trang web chính
            res.send('<script>window.opener.location.reload(); window.close();</script>');
        } catch (err) {
            console.log('Lỗi truy vấn:', err);
        }
    },

    // xử lý đăng nhập bằng facebook
    async loginFacebook(req, res) {
        const user = req.user;
        var facebookId = user.id;
        var displayName = user.displayName;
        var gender = user.gender;
        var avatar = user.photos[0].value;

        const connection = await db;
        try {
            // Kiểm tra FacebookId
            var sql = 'select * from users where FacebookId = ?';
            const [checkFacebookId] = await connection.execute(sql, [facebookId]);

            if (checkFacebookId.length > 0) {
                // Nếu facebookId tồn tại, tiến hành đăng nhập
                const userId = checkFacebookId[0].Id; // Lấy id người dùng

                //Kiểm tra xem đã có mã xác thực chưa(authToken)
                await generateAuthToken(userId, res); // Thêm mã xác thực vào cookie
            } else {
                // nếu facebookId không tồn tại, tạo mới tài khoản và thêm vào database
                sql = 'INSERT INTO Users (FacebookId, UserName, Avatar, Status) VALUES (?, ?, ?, ?)';
                const [insertUserResult] = await connection.execute(sql, [facebookId, displayName, avatar, 'Active']);

                const userId = insertUserResult.insertId; // Lấy id người dùng

                // Thêm vào userinfor
                sql = 'INSERT INTO usersinfor (userid, displayname, gender) VALUES (?, ?, ?)';
                await connection.execute(sql, [userId, displayName, gender || null]);

                // Kiểm tra xem đã có mã xác thực chưa(authToken)
                await generateAuthToken(userId, res); // Thêm mã xác thực vào cookie
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

            const verifyCode = generateVerificationCode();

            // Gửi mã xác nhận đến Email
            sendVerificationEmail(email, verifyCode);

            req.session.verifyCode = verifyCode;
            req.session.UserId = userId;

            res.json({ register: true });
        } catch (error) {
            console.error('Lỗi truy vấn:', error);
            res.status(500).json({ register: false });
        }
    },

    // gửi lại mã xác thực
    async sendVerifyCode(req, res) {
        const { email } = req.body;

        var verifyCode = generateVerificationCode();
        sendVerificationEmail(email, verifyCode);
        req.session.verifyCode = verifyCode;
        res.json({ sendVerifyCode: true });
    },

    // Xác thực email
    async verifyEmail(req, res) {
        const { verifyCode } = req.body;
        const verifyCodeSession = req.session.verifyCode;
        const UserIdSession = req.session.UserId;

        if (verifyCode == verifyCodeSession) {
            var sql = 'update users set Status = "Active" where Id = ?';

            const connection = await db;
            try {
                await connection.execute(sql, [UserIdSession]);
            } catch (err) {
                console.log('Lỗi truy vấn:', err);
            }

            res.json({ verifyEmail: true });
        } else {
            res.json({ verifyEmail: false });
        }
    },

    // Kiểm tra trạng thái tài khoản của người dùng
    async checkUserStatus(req, res) {

        if (res.locals.currentUser) {

            const CurrentUserId = res.locals.currentUser.Id;
            const connection = await db;
            try {
                var sql = 'SELECT * FROM users WHERE Id = ?';
                const [result] = await connection.execute(sql, [CurrentUserId]);

                if (result[0].Status == 'Active') {
                    res.json({ status: true });
                } else {
                    res.json({ status: false, email: result[0].Email });
                }

            } catch (err) {
                console.log('Lỗi truy vấn:', err);
            }
        } else {
            res.json({ message: 'Người dùng chưa đăng nhập' });
        }
    },

    // Một hàm middleware để xác thực người dùng trong mọi yêu cầu
    async authenticateUser(req, res, next) {
        const authToken = req.cookies.authToken; // Lấy mã xác thực từ cookie
        const connection = await db; // khai báo kết nối sql

        if (!authToken) {
            // Nếu auth token không được định nghĩa, bỏ qua truy vấn
            return next();
        }

        try {
            // Kiểm tra mã xác thực với cơ sở dữ liệu hoặc nơi bạn lưu nó
            var sql = 'SELECT * FROM authTokens WHERE tokens = ?';
            const [result] = await connection.execute(sql, [authToken]);

            if (result.length === 0) {
                console.log('NotAuthToken');
                next();
            } else {
                // Lấy thông tin người dùng từ cơ sở dữ liệu bằng userId
                const userId = result[0].UserId;
                sql = 'select * from users as u inner join usersinfor as ui on ui.UserId = u.Id where ui.userid = ?';
                const [userResult] = await connection.execute(sql, [userId]);

                if (userResult.length === 0) {
                    console.log('NotUser');
                    next(); // Chuyển tiếp yêu cầu
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
        const UserId = res.locals.currentUser;

        if (UserId) {
            next();
        } else {
            res.render('page404', { layout: '404layout' });
        }
    },
}