var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var Account = require("../models/Account");

var PASSWORD_LENGTH = 8;
var NUMBER_MINUMUM = 3;
var SPECIALTY_MINIMUM = 3;

var accountController = {};

accountController.postLoginRedirect = null;

/*
Updates the Account in req
*/
accountController.updateAccount = function(req,res,next) {
  if (req.session.passport && req.session.passport.user) {
    accountController.getAccount(req.session.passport.user._id, function(err, account) {
      if (err) { throw err; }
      req.account = account;
      next();
    });
  } else {
    next();
  }
}

// Get account by ID.
accountController.getAccount = function(id, next) {
  Account.findOne({
    _id: id
  }, function(err, account) {
    if (err) {
      throw err;
    }
    if (!account) {
      err = "[ERROR] no account found with _id: "+id;
    }
    next(err, account);
  });
}

/*
Get account from email
*/
accountController.getAccountFromEmail = function(email, next) {
  Account.findOne({ email: email}, function(err, account) {
    if (err) { throw err; }
    if (!account) {
      err = "[ERROR] no account found with email: "+email;
    }
    next(err, account);
  });
}

accountController.checkPasswordStrength = function(password, next) {
  if (!password) {
    err = "[ERROR] no password provided.";
    return next(err, false);
  } else if (password.length < PASSWORD_LENGTH) {
    err = "[ERROR] password needs to be at least "+PASSWORD_LENGTH+" characters long.";
    return next(err, false);
  } else if (password.replace(/[^0-9]/g,"").length < NUMBER_MINUMUM) {
    err = "[ERROR] password needs to have at least "+NUMBER_MINUMUM+" numbers.";
    return next(err, false);
  } else if (password.replace(/[a-zA-Z\d\s:]/gi,"").length < SPECIALTY_MINIMUM) {
    err = "[ERROR] password needs to have at least "+SPECIALTY_MINIMUM+" non-alphanumeric characters.";
    return next(err, false);
  } else {
    return next(null, true);
  }
}

/*
Create account with email  and password.
Assume email is uniqu and valid. This method will check password strength.
*/
accountController.createAccount = function(email, password, next) {
  accountController.checkPasswordStrength(password, function(err, successful) {
    if (err) { return next(err, null); }
    else {
      // Generate new account object.
      account = new Account({
        email: email,
        provider: 'local'
      });

      // set password and save.
      account.updatePassword(password, function(err, successful) {
        account.save(function(err) {
          return next(err, account);
        });
      });
    }
  });

}

module.exports = accountController;
