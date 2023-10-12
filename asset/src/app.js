const express = require('express')
const handlebars = require('express-handlebars')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const session = require('express-session');
const passportConfigs = require('./configs/passport');
const app = express()
const path = require('path')
const host = 'localhost'
const port = 2310


// Sử dụng express-session
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false
}));

// Đăng ký và sử dụng Passport trong ứng dụng
app.use(passportConfigs.session());
app.use(passportConfigs.initialize());

//Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

//HTTP Logger
// app.use(morgan('dev'))

//Views Engine
app.engine('hbs', handlebars({ extname: '.hbs' }))
app.set('view engine', 'hbs')

//Folder Views
app.set('views', path.join(__dirname, 'views'))

//Folder Public Statics
app.use(express.static(path.join(__dirname, '../', 'public')))

//Router
const homeRouter = require('./routers/homeRouter');
const productRouter = require('./routers/productRouter');
const userRouter = require('./routers/userRouter');
const uploadRouter = require('./routers/uploadRouter');
const apiRouter = require('./routers/apiRouter');
const authRouter = require('./routers/authRouter');

app.use('/', homeRouter);
app.use('/', authRouter);
app.use('/san-pham', productRouter);
app.use('/nguoi-dung', userRouter);
app.use('/upload', uploadRouter);
app.use('/api', apiRouter);


app.listen(port, () => console.log(`Ứng dụng chạy trên http://${host}:${port}`))