// configure the dot-env for reading environment variables
require('dotenv').config();
// import necessary module
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var csrf = require('csurf');
var flash = require('connect-flash');


// import router
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// configure app
var app = express();

// configurations
// const url = "mongodb+srv://shailly_1512:Shailly_54@shailly5.jwd2z.mongodb.net/meetingx-temp?retryWrites=true&w=majority";
const url = 'mongodb://localhost:27017/meetingx'; 
// establish connection with db
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(function(){
    console.log("connected with DB!");
}).catch(function(err){
    console.log(err);
    console.log('Failed to connect with DB!');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// setup middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// setup express-session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
      mongooseConnection: mongoose.connection
    }),
    cookie: {maxAge: 180 * 60 * 1000}
  }));  
// configure flash
app.use(flash());
app.use(csrf());

// app.use(session({ cookie: { maxAge: 60000 }}));
app.use('/', indexRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
