var express = require('express');
var router = express.Router();
var {verifyUserToken} = require('./verify_jwt');
const User = require('../models/user');
const Meeting = require('../models/meeting');
const meetingRouter = require('./meeting_routes');

// meeting routes
router.use('/', meetingRouter);
// all routes requires validation
router.use(verifyUserToken);
// fetches the dashboard for the user
router.get('/dashboard', function(req, res, next) {
  res.locals.error = req.flash('error'); req.flash('error', '');
  res.locals.success = req.flash('success'); req.flash('success', '');
  res.locals.csrfToken = req.csrfToken();
  User.findOne({email: req.auth_email}).then(user => {
    if (!user) {
      req.flash('error', 'Invalid username!');
      res.clearCookie('jwt');
      res.redirect('/signin');
    } else {
      res.locals.user = user;
      Meeting.find({authorEmail: user.email}).then(meetings => {
        res.locals.meetings = meetings;
        res.render('users/dashboard');
      }).catch(err => {
        res.locals.meetings = [];
        res.locals.error = 'Failed to fetch your meetings!';
        res.render('users/dashboard');
      });
    }
  }).catch(err => {
    console.log(err);
    res.clearCookie('jwt');
    req.flash('error', 'Failed to connect to database');
    res.redirect('/signin');
  });
});


// updates the profile
router.post('/update', (req, res) => {
  // fetch and validate
  let {username, email, old_password, new_password} = req.body;
  if (!username || !email || !old_password || !new_password)  return res.status(401).send();
  // validate auth email
  if (email !== req.auth_email) return res.status(403).send();
  // find user 
  User.findOne({email: email}).then(user => {
    if (!user) {
      req.flash('error', 'Invalid username!');
      res.redirect('/dashboard');
    } else if (!user.isValidPassword(old_password)){
      req.flash('error', 'Invalid old password!');
      res.redirect('/dashboard');
    } else {
      user.username = username;
      user.password = user.encryptPassword(new_password);
      user.save().then(()=>{
        req.flash('success', 'Your profile was updated successfully!');
        res.redirect('/dashboard');
      }).catch(err => {
        console.log(err);
        req.flash('error', 'Failed to save your details to database!');
        res.redirect('/dashboard');
      });
    }
  }).catch(err => {
    console.log(err);
    req.flash('error', 'Failed to fetch details from database!');
    res.redirect('/dashboard');
  });
});


// export the router
module.exports = router;