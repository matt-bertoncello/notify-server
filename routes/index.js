var express = require('express');
var router = express.Router();
var authController = require("../controllers/AuthController.js");
var accountController = require("../controllers/AccountController.js");
require('dotenv').config();

router.get('/', accountController.updateAccount, function(req,res) {
  req.session.host = process.env.APPLICATION_NAME;
  res.redirect('/developer');
});

router.get('/account', authController.checkAuthentication, function(req,res) {
  // If the password has been updated, provide it to the ejs file, and change updatePassword to false for next load.
  req.updatedPassword = authController.updatedPassword;
  authController.updatedPassword = false;
  res.render('auth/account', {req: req});
});

router.get('/loginerror', (req, res, next) => {
  console.log(req.flash('error'));
});

/* LOGIN capabilities. If account is already logged in, redirect to account page. */
router.get('/login', (req, res, next) => {
  if(req.session.passport && req.session.passport.user) {
    console.log('[ERROR] '+req.session.passport.user._id+" is already logged in");
    res.redirect('/account');
  } else {
    req.loginComment = authController.loginComment;
    delete authController.loginComment;
    res.render('auth/login', {req: req});
  }
});

router.get('/register', (req, res, next) => {
  if(req.session.passport && req.session.passport.user) {
    console.log('[ERROR] '+req.session.passport.user._id+" is already logged in");
    res.redirect('/account');
  } else {
    req.registerComment = authController.registerComment;
    authController.registerComment = { email: null, password1: null, password2: null };
    res.render('auth/register', {req: req});
  }
});

function updateSession(req, res, next) {
  next();
}

module.exports = router;
