const express = require('express')
const handlebars = require('express-handlebars')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const app = express()
const path = require('path')
const host = 'localhost'
const port = 3000

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

app.use('/', homeRouter);
app.use('/san-pham', productRouter);
app.use('/nguoi-dung', userRouter);

app.listen(port, () => console.log(`Ứng dụng chạy trên http://${host}:${port}`))