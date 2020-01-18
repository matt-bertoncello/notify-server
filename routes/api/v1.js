var express = require('express');
var router = express.Router();
var authController = require("../../controllers/AuthController.js");
var userController = require("../../controllers/UserController.js");
var notifyController = require("../../controllers/notify/NotifyController.js");

/*
Confirm email and password are correct.
If correct, reply with auth token.
If error, handle and reply with error.
*/
router.get('/login', function(req, res) {
  authController.attempt_login(req.headers['email'], req.headers['password'], function(err, user, loginError) {

    // If there was a login error:
    if (loginError && loginError.message) {
      console.log("[API LOGIN] "+loginError.message)
      res.statusCode = 401; // unauthorized
      res.json({'message': loginError.message});
      res.end();
    } else if (err || !user) {
      res.statusCode = 500; // server error.
      res.json({'message': 'error code: 101'});
      res.end();
    }
    // If login was successful, responde with successful status and provide authToken for future. Save firebaseInstance to User.
    else {
      // create response.
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({'auth-token': user.notify.authToken});
      res.end();
      console.log('user logged-in via API: '+user._id);

      notifyController.allocateFirebaseTokenToUser(user, req.headers['firebase-instance-id'], function(err, success) {
        if (err) {throw err}
        if (!err&& !success) {throw "server error 203"}
      });
    }
  });
});

/*
Retrieve user data from the authToken.
*/
router.get('/user', function(req, res) {
  userController.getUserFromAuthToken(req.headers['auth-token'], function(err, user) {
    // If there was a login error:
    if (err) {
      res.statusCode = 401; // unauthorized
      res.json({'message': err});
      res.end();
    } else if (!user) {
      res.statusCode = 500; // server error
      res.json({'message': 'error code: 101'});
      res.end();
    }
    // If login was successful:
    else {
      // create response.
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        'email': user.email,
        '_id': user._id,
      });
      res.end();
      console.log('retrieved user data via API: '+user._id);
    }
  });
});

/*
Log-out user. Remove token from user list.
*/
router.get('/logout', function(req, res) {
  // retrieve user from authToken.
  userController.getUserFromAuthToken(req.headers['auth-token'], function(err, user) {
    // If there was a login error:
    if (err) {
      res.statusCode = 401; // unauthorized
      res.json({'message': err});
      res.end();
    } else if (!user) {
      res.statusCode = 500; // server error
      res.json({'message': 'error code: 104'});
      res.end();
    } else {
      // remove the instance from the database.
      user.removeFirebaseInstance(req.headers['firebase-instance-id'], function(err, success) {
        if (err) {
          res.statusCode = 401; // unauthorized
          res.json({'message': err});
          res.end();
        }
        // create response.
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({'message': 'success'});
        res.end();

      });
    }
  });
});

module.exports = router;
