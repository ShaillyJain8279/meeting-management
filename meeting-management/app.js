// configure the dot-env for reading environment variables
require('dotenv').config();
// import necessary module
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
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

// establish connection with db
mongoose.connect(process.env.DB_URL, {
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


// use routers
app.use('/', indexRouter);
app.use('/', usersRouter);

// listen to requests
app.listen(process.env.PORT, process.env.IP, function(){
  console.log('Server listening on port ' + process.env.PORT);
});
