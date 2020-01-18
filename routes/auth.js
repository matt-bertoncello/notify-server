var express = require('express');
var router = express.Router();
var passport = require("passport");
var passportFacebook = require('../controllers/auth/facebook');
var passportTwitter = require('../controllers/auth/twitter');
var passportGoogle = require('../controllers/auth/google');
var passportGitHub = require('../controllers/auth/github');
var authController = require("../controllers/AuthController.js");
var userController = require("../controllers/UserController.js");

/* LOGOUT ROUTER */
router.get('/logout', function(req, res){
  req.logout();
  delete req.session.passport;  // stores user._id
  delete req.user;  // stores user
  res.redirect('/');
});

/* FACEBOOK ROUTER */
router.get('/facebook',
  passportFacebook.authenticate('facebook', { scope : ['email'] }));

router.get('/facebook/callback',
  passportFacebook.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('[INFO] user logged-in via facebook: '+req.session.passport.user._id);
    req.session.passport.loginProvider = "facebook";
    authController.postAuthentication(req, res);
  });

/* TWITTER ROUTER */
router.get('/twitter',
  passportTwitter.authenticate('twitter', { scope: ['include_email=true']}));

router.get('/twitter/callback',
  passportTwitter.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('[INFO] user logged-in via twitter: '+req.session.passport.user._id);
    req.session.passport.loginProvider = "twitter";
    authController.postAuthentication(req, res);
  });

/* GOOGLE ROUTER */
router.get('/google',
  passportGoogle.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/userinfo.email'] }));

router.get('/google/callback',
  passportGoogle.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('[INFO] user logged-in via google: '+req.session.passport.user._id);
    req.session.passport.loginProvider = "google";
    authController.postAuthentication(req, res);
  });

/* GITHUB ROUTER */
router.get('/github',
  passportGitHub.authenticate('github', { scope: [ 'user:email' ] }));

router.get('/github/callback',
  passportGitHub.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('[INFO] user logged-in via github: '+req.session.passport.user._id);
    req.session.passport.loginProvider = "github";
    authController.postAuthentication(req, res);
  });

/* LOCAL ROUTER */
// router.post('/local/login', (req, res) => authController.doLogin(req, res));

router.post('/local/login',
  passport.authenticate('local', { failureRedirect: '/login'}),
  function(req, res, next) {
    console.log('[INFO] user logged-in via local: '+req.session.passport.user._id);
    req.session.passport.loginProvider = "local";
    authController.postAuthentication(req, res);
  });

/*
Called when registration form is sent.
1. confirm email is valid and unique.
2. confirm username is valid and unique.
3. confirm password1 is the same as password2.
4. confirm the password is strong enough.
5. create and save user with.
6. login user.
*/
router.post('/local/register', (req, res) => {
  error = false;

  // confirm email is in the right format.
  if (!authController.isEmail(req.body.email)) {
    error = true;
    authController.registerComment.email = "[ERROR] Not a valid email.";
  }
  // confirm email is unique.
  userController.getUserFromEmail(req.body.email, function(err, user) {
    if (user) {
      error = true;
      authController.registerComment.email = "[ERROR] Email is already used.";
    }
    // confirm username is unique.
    userController.getUserFromUsername(req.body.username, function(err, user) {
      if (user) {
        error = true;
        authController.registerComment.username = "[ERROR] Username is taken.";
      }
      // confirm password is strong enough.
      userController.checkPasswordStrength(req.body.password1, function(err, successful) {
        if (err) {
          error = true;
          authController.registerComment.password1 = err;
        }
        // confirm password1 is the same as password2.
        if (req.body.password1 != req.body.password2) {
          error = true;
          authController.registerComment.password2 = "[ERROR] Passwords are not the same.";
        }

        // if there was any error, reload page and render errors.
        if (error) {
          res.redirect('/register');
        } else {
          // if no error, createUser.
          userController.createUser(req.body.email, req.body.username, req.body.password1, function(err, user) {
            if (err) {
              console.log(err);
              authController.registerComment.email = err; // comment is rendered on next load of /register. index.js delete's after being rendered once.
              res.redirect('/register');
            }
            else {
              req.login(user, function(err) {
                if (err) { console.log(err); }
                return res.redirect('/user');
              });
            }
          });
        }
      });
    });
  });
});

module.exports = router;
