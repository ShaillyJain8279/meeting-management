var express = require('express');
var router = express.Router();
var {verifyUserToken} = require('./verify_jwt');
const User = require('../models/user');
const Meeting = require('../models/meeting');

router.use(verifyUserToken);
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
      Meeting.find({organiser: user.email}).then(meetings => {
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

router.get('/add', (req, res) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.isEdit = false;
  User.findOne({email: req.auth_email}).then(user => {
    if (!user) {
      req.flash('error', 'Invalid username!');
      res.clearCookie('jwt');
      res.redirect('/signin');
    } else {
      res.locals.user = user;
      res.locals.meeting = null;
      res.render('users/meeting_form');
    }
  }).catch(err => {
    console.log(err);
    res.clearCookie('jwt');
    req.flash('error', 'Failed to connect to database');
    res.redirect('/signin');
  });
});

router.post('/add', (req, res) => {
  // fetch and validate
  let {meeting_id, title, organiser, datetime, attendies} = req.body;
  // validate fields
  if (!meeting_id || !title || !organiser || !datetime)
    return res.status(401).send();
  // validate email
  if (organiser !== req.auth_email) return res.status(403).send();
  // create a new meeting
  let meeting = new Meeting({ meeting_id, title, organiser, datetime, attendies});
  // save the meeting
  meeting.save().then(()=>{
    req.flash('success', 'Meeting saved successfully!');
    res.redirect('/dashboard');
  }).catch(err => {
    console.log(err);
    req.flash('error', 'Failed to save meeting!');
    res.redirect('/dashboard');
  });
});


module.exports = router;
