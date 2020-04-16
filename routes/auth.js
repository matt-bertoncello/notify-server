var express = require('express');
var router = express.Router();
var passport = require("passport");
var passportFacebook = require('../controllers/auth/facebook');
var passportTwitter = require('../controllers/auth/twitter');
var passportGoogle = require('../controllers/auth/google');
var passportGitHub = require('../controllers/auth/github');
var authController = require("../controllers/AuthController.js");
var accountController = require("../controllers/AccountController.js");

/* LOGOUT ROUTER */
router.get('/logout', function(req, res){
  req.logout();
  delete req.session.passport;  // stores account._id
  delete req.account;  // stores account
  res.redirect('/');
});

/* FACEBOOK ROUTER */
router.get('/facebook',
  passportFacebook.authenticate('facebook', { scope : ['email'] }));

router.get('/facebook/callback',
  passportFacebook.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('[INFO] account logged-in via facebook: '+req.session.passport.user._id);
    req.session.passport.loginProvider = "facebook";
    authController.postAuthentication(req, res);
  });

/* TWITTER ROUTER */
router.get('/twitter',
  passportTwitter.authenticate('twitter', { scope: ['include_email=true']}));

router.get('/twitter/callback',
  passportTwitter.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('[INFO] account logged-in via twitter: '+req.session.passport.user._id);
    req.session.passport.loginProvider = "twitter";
    authController.postAuthentication(req, res);
  });

/* GOOGLE ROUTER */
router.get('/google',
  passportGoogle.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/accountinfo.email'] }));

router.get('/google/callback',
  passportGoogle.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('[INFO] account logged-in via google: '+req.session.passport.user._id);
    req.session.passport.loginProvider = "google";
    authController.postAuthentication(req, res);
  });

/* GITHUB ROUTER */
router.get('/github',
  passportGitHub.authenticate('github', { scope: [ 'account:email' ] }));

router.get('/github/callback',
  passportGitHub.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('[INFO] account logged-in via github: '+req.session.passport.user._id);
    req.session.passport.loginProvider = "github";
    authController.postAuthentication(req, res);
  });

/* LOCAL ROUTER */
//router.post('/local/login', (req, res) => console.log(req));

router.post('/local/login',
  passport.authenticate('local', { failureRedirect: '/login'}),
  function(req, res, next) {
    console.log('[INFO] account logged-in via local: '+req.session.passport.user._id);
    req.session.passport.loginProvider = "local";
    authController.postAuthentication(req, res);
  });

/*
Called when registration form is sent.
1. confirm email is valid and unique.
2. confirm password1 is the same as password2.
3. confirm the password is strong enough.
4. create and save account with.
5. login account.
*/
router.post('/local/register', (req, res) => {
  error = false;

  // confirm email is in the right format.
  if (!authController.isEmail(req.body.email)) {
    error = true;
    authController.registerComment.email = "[ERROR] Not a valid email.";
  }
  // confirm email is unique.
  accountController.getAccountFromEmail(req.body.email, function(err, account) {
    if (account) {
      error = true;
      authController.registerComment.email = "[ERROR] Email is already used.";
    }
    // confirm password is strong enough.
    accountController.checkPasswordStrength(req.body.password1, function(err, successful) {
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
        // if no error, createAccount.
        accountController.createAccount(req.body.email, req.body.password1, function(err, account) {
          if (err) {
            console.log(err);
            authController.registerComment.email = err; // comment is rendered on next load of /register. index.js delete's after being rendered once.
            res.redirect('/register');
          }
          else {
            req.login(account, function(err) {
              if (err) { console.log(err); }
              return res.redirect('/account');
            });
          }
        });
      }
    });
  });
});

module.exports = router;
