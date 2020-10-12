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
  // create a new meeting
  let meeting = new Meeting({ authorEmail: req.auth_email, meeting_id, title, organiser, datetime, attendies});
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

// delete a meeting with id
router.post('/delete', (req, res) => {
  // fetch and validate
  let {deleteMeetingId} = req.body;
  if (!deleteMeetingId) return res.status(401).send();
  // find and delete the meeting
  Meeting.findOneAndDelete({_id: deleteMeetingId}).then(()=>{
    req.flash('success', 'Meeting details deleted successfully!');
    res.redirect('/dashboard');
  }).catch(err => {
    console.log(err);
    req.flash('error', 'Failed to delete meeting detais!');
    res.redirect('/dashboard');
  });
});


// redirect user for edit-get request
router.get('/editMeetingForm', (req, res)=>{
  res.redirect('/dashboard');
});
// sends form for editing meeting
router.post('/editMeetingForm', (req, res) => {
  // fetch and validate
  let {editMeetingId} = req.body;
  if (!editMeetingId) return res.status(401).send();
  // find meeting and send form
  Meeting.findOne({_id: editMeetingId}).then(meeting => {
    if (!meeting) {
      req.flash('error', 'That meeting does not exist anymore!');
      res.redirect('/dashboard');
    } else {
      res.locals.csrfToken = req.csrfToken();
      res.locals.isEdit = true;  
      res.locals.meeting = meeting;
      User.findOne({email: req.auth_email}).then(user => {
        if (!user) {
          req.flash('error', 'Invalid username!');
          res.clearCookie('jwt');
          res.redirect('/signin');
        } else {
          res.locals.user = user;
          res.render('users/meeting_form');
        }
      }).catch(err => {
        console.log(err);
        res.clearCookie('jwt');
        req.flash('error', 'Failed to connect to database');
        res.redirect('/signin');
      });    
    }
  }).catch(err => {
    console.log(err);
    req.flash('error', 'Failed to fetch details from database!');
    res.redirect('/dashboard');
  });
});


// implements the edit meeting functionality
router.post('/edit', (req, res) => {
  // fetch and validate
  let {meeting_id, title, organiser, datetime, attendies, _id} = req.body;
  if (!meeting_id || !title || !organiser || !datetime || !attendies || !_id)
    return res.status(401).send();

  // find meeting and update details
  Meeting.findOne({_id : _id}).then(meeting => {
    if (!meeting) {
      req.flash('error', 'That meeting does not exist anymore!');
      res.redirect('/dashboard');
    } else {
      meeting.meeting_id = meeting_id;
      meeting.title = title;
      meeting.organiser = organiser;
      meeting.datetime = datetime;
      meeting.attendies = attendies;
      meeting.save().then(()=>{
        req.flash('success', 'Meeting details updated succesfully!');
        res.redirect('/dashboard');
      }).catch(err => {
        console.log(err);
        req.flash('error', 'Failed to update meeting details!');
        res.redirect('/dashboard');
      });
    }
  }).catch(err => {
    console.log(err);
    req.flash('error', 'Failed to fetch details from database!');
    res.redirect('/dashboard');
  });
});

module.exports = router;
