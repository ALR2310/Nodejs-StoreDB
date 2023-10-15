const db = require('../configs/dbconnect');
// const wss = require('../configs/websocket');

// // Thêm bình luận sản phẩm
// wss.on('connection', (ws) => {
//     console.log('client connected');

//     ws.on('message', async (prdComment) => {

//     });

//     ws.on('close', () => {
//         console.log('Client disconnected.');
//     });
// });




// định dạng này thành chuỗi
function formatRelativeDate(inputDate) {
    const currentDate = new Date();
    const timeDifference = currentDate - inputDate;

    // Chuyển đổi thời gian từ mili giây sang phút
    const minutesDifference = timeDifference / (1000 * 60);

    if (minutesDifference >= 60) {
        const hoursDifference = minutesDifference / 60;
        if (hoursDifference >= 24) {
            const daysDifference = hoursDifference / 24;
            if (daysDifference >= 30) {
                const monthsDifference = currentDate.getMonth() - inputDate.getMonth() + (12 * (currentDate.getFullYear() - inputDate.getFullYear()));
                if (monthsDifference >= 12) {
                    const yearsDifference = currentDate.getFullYear() - inputDate.getFullYear();
                    return `${yearsDifference} năm trước`;
                } else {
                    return `${monthsDifference} tháng trước`;
                }
            } else {
                return `${Math.floor(daysDifference)} ngày trước`;
            }
        } else {
            return `${Math.floor(hoursDifference)} giờ trước`;
        }
    } else {
        if (minutesDifference < 1) {
            return `vừa xong`;
        } else {
            return `${Math.floor(minutesDifference)} phút trước`;
        }
    }
}
// Lấy tổng số đánh giá 5sao
async function loadTotalRating(productId) {
    const connection = await db;
    try {
        var sql = "select count(rating) as 'star' from productreviews where rating = 5 and ProductId = ?";
        const [star5] = await connection.execute(sql, [productId]);

        sql = "select count(rating) as 'star' from productreviews where rating = 4 and ProductId = ?";
        const [star4] = await connection.execute(sql, [productId]);

        sql = "select count(rating) as 'star' from productreviews where rating = 3 and ProductId = ?";
        const [star3] = await connection.execute(sql, [productId]);

        sql = "select count(rating) as 'star' from productreviews where rating = 2 and ProductId = ?";
        const [star2] = await connection.execute(sql, [productId]);

        sql = "select count(rating) as 'star' from productreviews where rating = 1 and ProductId = ?";
        const [star1] = await connection.execute(sql, [productId]);

        const totalRating = {
            'star5': star5[0].star,
            'star4': star4[0].star,
            'star3': star3[0].star,
            'star2': star2[0].star,
            'star1': star1[0].star
        }
        return totalRating;
    } catch (err) {
        console.log()
    }
}
// Lấy thông tin sản phẩm
async function loadProduct(productId) {
    const connection = await db;
    try {
        // Lấy thông tin sản phẩm
        var sql = 'select * from product as p inner join productdesc as pd on p.Id = pd.ProductId where p.Id = ?';
        var params = [productId];
        const [rows] = await connection.execute(sql, params);

        // Trả về kết quả
        return rows[0];
    } catch (err) {
        console.log('Lỗi truy vấn:', err);
    }
}

async function LoadListProduct() {
    const connection = await db;
    try {
        // Lấy thông tin sản phẩm
        var sql = 'select * from product order by Id desc limit 5';
        const [rows] = await connection.execute(sql);

        // Trả về kết quả
        return rows;
    } catch (err) {
        console.log('Lỗi truy vấn:', err);
    }
}
// Lấy danh sách các đánh giá của sản phẩm
async function loadProductReviews(productId) {
    const connection = await db;
    try {
        // Sử dụng LIMIT và OFFSET để truy vấn danh sách đánh giá
        var sql = 'SELECT * FROM productreviews WHERE ProductId = ? AND Status = "Active" ORDER BY Id DESC limit 3'
        var params = [productId];

        const [result] = await connection.execute(sql, params);

        if (result.length > 0) {
            const resultFormat = result.map(review => {
                review.AtCreate = formatRelativeDate(review.AtCreate);
                return review;
            });
            return resultFormat;
        } else {
            return [];
        }
    } catch (err) {
        console.log('Lỗi truy vấn:', err);
    }
}
// Lấy danh sách các bình luận của sản phẩm
async function loadProductComment(productId) {
    const connection = await db;
    try {
        var sql = 'SELECT * FROM ProductComments WHERE ProductId = ? AND Status = "Active" ORDER BY Id DESC limit 3';
        var params = [productId];

        const [result] = await connection.execute(sql, params);

        if (result.length > 0) {
            const resultFormat = result.map(comment => {
                comment.AtCreate = formatRelativeDate(comment.AtCreate);
                return comment;
            });
            return resultFormat;
        } else {
            return [];
        }
    } catch (err) {
        console.log('Lỗi truy vấn:', err);
    }
}

// Lấy số lượng các bình luận
async function loadTotalComment() {
    const connection = await db;
    try {
        var sql = 'SELECT * FROM ProductComments WHERE Status = "Active"';
        const result = await connection.execute(sql);

        return result.length;
    } catch (err) {
        console.log('Lỗi truy vấn:', err);
    }
}

module.exports = {
    // Router:/san-pham/:slugs
    // Mở trang xem chi tiết sản phẩm
    async index(req, res) {
        const ProductSlugs = req.params.Slugs;
        var ProductId;

        const connection = await db;
        // Lấy id của sản phẩm dựa trên slugsUrl
        try {
            var sql = 'select Id from product where slugs = ?';
            var params = [ProductSlugs];
            const [rows] = await connection.execute(sql, params);

            ProductId = rows[0].Id;
        } catch (err) {
            console.log('Lỗi truy vấn: ' + err);
        }

        const totalRating = await loadTotalRating(ProductId); // lấy số đánh giá
        const product = await loadProduct(ProductId); // lấy sản phẩm
        const productReviews = await loadProductReviews(ProductId); // lấy đánh giá sản phẩm
        const ProductComments = await loadProductComment(ProductId); // lấy bình luận sản phẩm
        const totalComment = await loadTotalComment(ProductId); // lấy số lượng bình luận
        const listProduct = await LoadListProduct(ProductId); // lấy ra danh sách sản phẩm

        console.log(listProduct);

        // Kiểm tra xem 2 biến này có tồn tại không
        if (product && productReviews) {
            res.render('product/index', {
                product: product,
                listProduct: listProduct,
                productReviews: productReviews,
                ProductComments: ProductComments,
                rating: totalRating,
                totalComment: totalComment
            });
        } else {
            res.render('page404', { layout: '404layout' });
        }
    },

    // Thêm đánh giá sản phẩm
    async createProductReviews(req, res) {
        const { productId, userName, userEmail, gender, rating, description } = req.body;

        var userId, avatarUser, sql, params;

        if (res.locals.currentUser) {
            userId = res.locals.currentUser.UserId
        }

        const connection = await db;
        try {
            // Lấy avatar của người dùng nếu có người dùng
            if (userId == undefined) {
                // Đặt avatar mặt định
                avatarUser = '/images/defaultAvatar.jpg'
            } else {
                // lấy avatar của người dùng
                sql = 'select Avatar from users where Id = ?';
                params = [userId];
                const [row] = await connection.execute(sql, params);
                avatarUser = row[0].Avatar;
            }

            // Thêm đánh giá
            sql = 'insert productreviews(productId, userid, avatar, username, email, gender, rating, description) value (?, ?, ?, ?, ?, ?, ?, ?)';
            params = [productId, userId || null, avatarUser, userName, userEmail, gender, rating, description];
            await connection.execute(sql, params);

            // Trả kết quả về client
            res.json({ success: true });
        } catch (err) {
            console.log('Lỗi truy vấn:', err);
        }
    },

    // Lấy thêm dữ liệu từ bảng productreviews
    async loadMoreReviews(req, res) {
        const connection = await db;
        try {
            const productId = parseInt(req.query.Id);
            const offsetPage = parseInt(req.query.Offset);

            var sql = `select * from productreviews where ProductId = ? and Status = ? order by Id desc limit 3 offset ${offsetPage}`;
            var params = [productId, 'Active'];

            const [result] = await connection.execute(sql, params);

            if (result.length > 0) {
                const resultFormat = result.map(review => {
                    review.AtCreate = formatRelativeDate(review.AtCreate);
                    return review;
                });

                return res.json({
                    success: true,
                    notice: 'Lấy dữ liệu thành công',
                    data: resultFormat
                });
            }
        } catch (err) {
            console.log(err);
        }
    },

    // Thêm bình luận cho sản phẩm
    async createProductComments(req, res) {
        const { productId, userId, username, email, description } = req.body;
        var avatarUser;

        const connection = await db;
        try {
            // Lấy avatar của người dùng nếu có người dùng
            if (userId == undefined) {
                // Đặt avatar mặt định
                avatarUser = '/images/defaultAvatar.jpg'
            } else {
                // lấy avatar của người dùng
                var sql = 'select Avatar from users where Id = ?';
                const [row] = await connection.execute(sql, [userId]);
                avatarUser = row[0].Avatar;
            }

            var sql = 'insert into productcomments(ProductId, UserId, Avatar, UserName, Email, Description) value(?, ?, ?, ?, ?, ?)';
            var params = [productId, userId, avatarUser, username, email, description];
            await connection.execute(sql, params);

            // Trả kết quả về client
            res.json({ success: true });

        } catch (err) {
            console.log('Lỗi truy vấn: ' + err);
        }
    },

    async loadMoreComments(req, res) {
        const connection = await db;
        try {
            const productId = parseInt(req.query.Id);
            const offsetPage = parseInt(req.query.Offset);

            var sql = `select * from productcomments where ProductId = ? and Status = ? order by Id desc limit 3 offset ${offsetPage}`;
            var params = [productId, 'Active'];

            const [result] = await connection.execute(sql, params);

            if (result.length > 0) {
                const resultFormat = result.map(comment => {
                    comment.AtCreate = formatRelativeDate(comment.AtCreate);
                    return comment;
                });

                return res.json({
                    success: true,
                    notice: 'Lấy dữ liệu thành công',
                    data: resultFormat
                })
            }
        } catch (err) {
            console.log('Lỗi truy vấn: ', err);
        }
    },

    async SortPorductComments(req, res) {
        const { action, productId } = req.query;
        var sql, params;
        const connection = await db;

        try {
            if (action == 'newest') {
                sql = 'select * from productcomments where ProductId = ? and Status = ? order by Id desc';
            } else if (action == 'oldest') {
                sql = 'select * from productcomments where ProductId = ? and Status = ? order by Id asc';
            }

            params = [productId, 'Active'];
            const [result] = await connection.execute(sql, params);

            if (result.length > 0) {
                const resultFormat = result.map(comment => {
                    comment.AtCreate = formatRelativeDate(comment.AtCreate);
                    return comment;
                });
                return res.json({ data: result });;
            } else {
                return res.json({ data: [] });;
            }



        } catch (err) {
            console.log('Lỗi truy vấn: ' + err);
        }
    }
}