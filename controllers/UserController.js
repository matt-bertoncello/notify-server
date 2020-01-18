var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("../models/User");

var PASSWORD_LENGTH = 8;
var NUMBER_MINUMUM = 3;
var SPECIALTY_MINIMUM = 3;

var userController = {};

userController.postLoginRedirect = null;

/*
Updates the User in req
*/
userController.updateUser = function(req,res,next) {
  if (req.session.passport && req.session.passport.user) {
    userController.getUser(req.session.passport.user._id, function(err, user) {
      if (err) { throw err; }
      req.user = user;
      next();
    });
  } else {
    next();
  }
}

/*
If username is not valid or unique, redirect to user update page.
*/
userController.checkUsername = function(req, res, next) {
  exceptions = ["/user"];

  if (req.user.username || exceptions.includes(req.originalUrl)) {
    next();
  } else {
    userController.postLoginRedirect = req.originalUrl;
    console.log('[ERROR] user does not have unique username. Post-authentication redirect: '+userController.postLoginRedirect);
    res.redirect("/user");
  }
}

// Get user by ID.
userController.getUser = function(id, next) {
  User.findOne({
    _id: id
  }, function(err, user) {
    if (err) {
      throw err;
    }
    if (!user) {
      err = "[ERROR] no user found with _id: "+id;
    }
    next(err, user);
  });
}

// Retrieve user by Id, then update username. Return error.
userController.updateUsername = function(id, username, next) {
  userController.getUser(id, function(err, user) {
    if (err) { throw err; }
    user.username = username;
    user.save(function(err) {
      next(err);
    })
  })
}

/*
Get user from username
*/
userController.getUserFromUsername = function(username, next) {
  User.findOne({ username: username}, function(err, user) {
    if (err) { throw err; }
    if (!user) {
      err = "[ERROR] no user found with username: "+username;
    }
    next(err, user);
  });
}

/*
Get user from email
*/
userController.getUserFromEmail = function(email, next) {
  User.findOne({ email: email}, function(err, user) {
    if (err) { throw err; }
    if (!user) {
      err = "[ERROR] no user found with email: "+email;
    }
    next(err, user);
  });
}

/*
Get user from auth_token.
*/
userController.getUserFromAuthToken = function(auth_token, next) {
  User.findOne({ 'notify.auth_token': auth_token}, function(err, user) {
    if (err) { throw err; }
    if (!user) {
      err = "[ERROR] no user found with auth_token: "+auth_token;
    }
    next(err, user);
  });
}

userController.checkPasswordStrength = function(password, next) {
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
Create user with email, username and password.
Assume email and username are valid. This method will check password strength.
*/
userController.createUser = function(email, username, password, next) {
  userController.checkPasswordStrength(password, function(err, successful) {
    if (err) { return next(err, null); }
    else {
      // Generate new user object.
      user = new User({
        email: email,
        username: username,
        provider: 'local'
      });

      // set password and save.
      user.updatePassword(password, function(err, successful) {
        user.save(function(err) {
          return next(err, user);
        });
      });
    }
  });

}

module.exports = userController;
