const jwt = require('jsonwebtoken');
const User = require('../models/user');

// verifies the token
exports.verifyUserToken = function(req, res, next) {
    // fetch the token from cookie
    let accessToken = req.cookies.jwt;
    // validate accessToken
    if (!accessToken) {
        req.flash('error', 'Your session has expired. Please login to continue!');
        return res.redirect('/signin');
    }
    try{
        // get the payload and verify the token
        let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);        
        // store the user in req.auth_email
        req.auth_email = payload.email;
        // proceed to next route - user authenticated
        next( );
    } catch (error) {
        // invalid token
        req.flash('error', "We couldn't verify your session. Please login to continue!");
        res.redirect('/signin');
    }
};

// refreshes the token
exports.refreshUserToken = function(req, res, next) {
    // fetch the token from cookie
    let accessToken = req.cookies.jwt;
    // validate accessToken
    if (!accessToken) {
        // if token doesn't exist then proceed
        return next( );
    }

    try{
        // get the payload and verify the token
        let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);        
        // fetch the user with given email
        User.findOne({email: payload.email}).then(user => {
            if (!user) {
                // if user doesn't exist then proceed for form
                req.flash('error', 'Invalid session. User not found!');
                next( );
            } else {
                // verify the refresh token
                jwt.verify(user.refreshToken, process.env.REFRESH_TOKEN_SECRET);
                // create a new token
                let newToken = jwt.sign({email: payload.email}, process.env.ACCESS_TOKEN_SECRET, {
                    algorithm: 'HS256',
                    expiresIn: process.env.ACCESS_TOKEN_LIFE
                });
                // store the token in cookie
                res.cookie('jwt', newToken);
                // redirect to dashboard
                res.redirect('/dashboard');
            }
        }).catch(err => {  
            console.log(err);
            next( );
        });

        // proceed to next route - user authenticated
        next( );
    } catch (error) {
        // invalid token - clear and proceed
        res.clearCookie('jwt');
        next( );
    }
};
