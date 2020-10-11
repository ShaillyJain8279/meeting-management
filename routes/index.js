var express = require('express');
var router = express.Router();
var User = require('../models/user');
var jwt = require('jsonwebtoken');
const {refreshUserToken} = require('./verify_jwt');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/signin', refreshUserToken, (req, res) => {
  res.locals.error =  req.flash('error'); req.flash('error', '');
  res.locals.success = req.flash('success'); req.flash('success', '');
  res.locals.csrfToken = req.csrfToken();
  res.render('auth_forms/auth_form', {signIn: true});
});

router.get('/signup', refreshUserToken, (req, res) => {
  res.locals.error =  req.flash('error'); req.flash('error', '');
  res.locals.success = req.flash('success'); req.flash('success', '');
  res.locals.csrfToken = req.csrfToken();
  res.render('auth_forms/auth_form', {signIn: false});
});

router.post('/signin', (req, res) => {
  // fetch and validate
  let {email, password} = req.body;
  // if not all fields are provided - unauthorized status
  if (!email || !password) return res.status(401).send();

  // find user by email
  // add user to database if not already exist
  User.findOne({email: email}).then(user => {
    if (!user) {
      req.flash('error', 'Invalid username!');
      res.redirect('/signin');
    } else {
      if (!user.isValidPassword(password)){
        req.flash('error', 'Invalid password!');
        res.redirect('/signin');
      } else {
        // create an access token
        let accessToken = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET, {
          algorithm: 'HS256',
          expiresIn: process.env.ACCESS_TOKEN_LIFE
        });
        // create a refresh token
        let refreshToken = jwt.sign({email: email}, process.env.REFRESH_TOKEN_SECRET, {
          algorithm: 'HS256',
          expiresIn: process.env.REFRESH_TOKEN_LIFE
        });
        // store the refresh token
        user.refreshToken = refreshToken;
        // save the user
        user.save().then(()=>{
          // store the access token in cookie
          res.cookie('jwt', accessToken);
          // redirect to dashboard
          res.redirect('/dashboard');
        }).catch(err => {
          console.log(err);
          req.flash('error', 'Failed to save your token!');
          res.redirect('/signin');
        });

      }
    }
  }).catch(err => {
    console.log(err);
    req.flash('error', 'Failed to connect to database!');
    res.redirect('/signin');
  });
});


router.post('/signup', (req, res) => {
  // fetch and validate
  let {username, email, password} = req.body;
  // if not all fields are provided - unauthorized status
  if (!username || !email || !password) return res.status(401).send();

  // if (!username)  {
  //   req.flash('error', 'Please provide a valid username!');
  //   res.redirect('/signup');
  // }
  // if (!email) {
  //   req.flash('error', 'Please provide a valid email!');
  //   res.redirect('/signup');
  // }
  // if (!password) {
  //   req.flash('error', 'Please provide a valid password!');
  //   res.redirect('/signup');
  // }

  // add user to database if not already exist
  User.findOne({email: email}).then(user => {
    if (user) {
      req.flash('error', 'That email has already been taken!');
      res.redirect('/signup');
    } else {
      let newUser = new User();
      newUser.username = username;
      newUser.email = email;
      newUser.password = newUser.encryptPassword(password);
      newUser.save().then(()=>{
        req.flash('success', 'Your registration was successful. Please login to continue!');
        res.redirect('/signin');
      }).catch(err => {
        console.log(err);
        req.flash('error', 'Failed to save user details!');
        res.redirect('/signup');
      });
    }
  }).catch(err => {
    console.log(err);
    req.flash('error', 'Failed to connect to database!');
    res.redirect('/signup');
  });

});

router.post('/logout', (req, res) => {
  // clear the cookie jwt
  res.clearCookie('jwt');
  req.auth_email = null;
  req.flash('success', 'You are successfully logged out!');
  res.redirect('/signin');
});


module.exports = router;
