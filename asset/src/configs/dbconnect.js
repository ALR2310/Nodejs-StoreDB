const mysql = require('mysql2/promise');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'storedb'
});

module.exports = db


