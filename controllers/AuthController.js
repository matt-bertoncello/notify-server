var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var accountController = require("./AccountController");
var Account = require("../models/Account");

var authController = {};

authController.loginComment = null;
authController.registerComment = {
  email: null,
  password1: null,
  password2: null
};

// Set serialize and deserialize functions;
passport.serializeUser(function(account, done) { done(null, account); });
passport.deserializeUser(function(obj, done) { done(null, obj); });

// Update the local login strategy.
passport.use(new LocalStrategy(
  function(email, password, done) {
    authController.attempt_login(email, password, done);
  }
));

authController.attempt_login = function(email, password, done) {
  if (!password) {  // If no password is provided,return error.
    err = '[ERROR] No password provided';
    return loginError(err, null, done);
  }
  if (authController.isEmail(email)) {  // If valid email
    accountController.getAccountFromEmail(email, function(err, account) {
      if (err) { return loginError(err, account, done); }
      else { authenticate_account(account, password, done); }
    });
  } else {  // If not a valid email
    err = '[ERROR] Not a valid email';
    return loginError(err, null, done);
  }
}

// Handle password comparison. Assume account is not null.
function authenticate_account(account, password, done) {
  account.comparePassword(password, function(err, match) {
    if (err || !match) { if (err) { return loginError(err, account, done); } }
    else { return done(null, account); }
  });
}

/*
Called when there is an authorization error during login.
Will save the error for the login screen to render.
*/
function loginError(err, account, done) {
  authController.loginComment = err;
  return done(null, null, {message: err});  // null, null so passport loads failureRedirect.
}

/*
Redirect to login page if account isn't logged in.
Load Account into req.account.
*/
authController.checkAuthentication = function(req,res,next){
  /* If session has never been initialised on client side, also redirect to login page */
  if (req.session.passport && req.session.passport.user) {
    accountController.updateAccount(req, res, function() {
      next();
    })
  } else {
    accountController.postLoginRedirect = req.originalUrl;
    console.log('[ERROR] account is not logged-in. Redirect to login page. Post-authentication redirect: '+accountController.postLoginRedirect);
    res.redirect("/login");
  }
}

/* Once account has been authenticated, run this function */
authController.postAuthentication = function(req, res) {
  /* If account came from 'checkAuthentication' middleware, return to initial page */
  if (accountController.postLoginRedirect) {
    redirect = accountController.postLoginRedirect;
    delete accountController.postLoginRedirect;
    console.log("[REDIRECT] redirected to: "+redirect)
    res.redirect(redirect);
  } else {
    res.redirect('/account');
  }
}

// logout
authController.logout = function(req, res) {
  console.log('[INFO] account logout')
  req.logout();
  res.redirect('/');
};

// Return true if string is in a valid email format.
authController.isEmail = function(string) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(string)) {
    return (true)
  } else {
    return (false)
  }
}

// return true of the user is authenitcated.
authController.isAuthenticated = function(req) {
  return (req.session.passport && req.session.passport.user);
}

module.exports = authController;
