var express = require('express');
var router = express.Router();
var updateUser = require("../controllers/UserController.js").updateUser;
var authController = require("../controllers/AuthController.js");
var userController = require("../controllers/UserController.js");
require('dotenv').config();

router.get('/', updateUser, function(req,res) {
  req.session.host = process.env.APPLICATION_NAME;
  res.render('index', {req: req});
});

router.get('/session', updateUser, function(req,res) { res.render('auth/session', {req: req}); });

router.get('/user', authController.checkAuthentication, function(req,res) {
  // If the password has been updated, provide it to the ejs file, and change updatePassword to false for next load.
  req.updatedPassword = authController.updatedPassword;
  authController.updatedPassword = false;
  res.render('auth/user', {req: req});
});

/* LOGIN capabilities. If user is already logged in, redirect to user page. */
router.get('/login', (req, res, next) => {
  if(req.session.passport && req.session.passport.user) {
    console.log('[ERROR] '+req.session.passport.user._id+" is already logged in");
    res.redirect('/user');
  } else {
    var comment = authController.loginComment;
    delete authController.loginComment;
    res.render('auth/login', {req: req, loginComment: comment});
  }
});

router.get('/register', (req, res, next) => {
  if(req.session.passport && req.session.passport.user) {
    console.log('[ERROR] '+req.session.passport.user._id+" is already logged in");
    res.redirect('/user');
  } else {
    var comment = authController.registerComment;
    authController.registerComment = { email: null, username: null, password1: null, password2: null };
    res.render('auth/register', {req: req, registerComment: comment});
  }
});

function updateSession(req, res, next) {
  next();
}

module.exports = router;
