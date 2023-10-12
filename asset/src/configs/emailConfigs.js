const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: 'ansaka147@gmail.com',
        pass: 'bnbzobpxchqtlsty'
    }
});

module.exports = transporter;