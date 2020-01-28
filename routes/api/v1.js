var express = require('express');
var router = express.Router();
var authController = require("../../controllers/AuthController.js");
var userController = require("../../controllers/UserController.js");
var notifyController = require("../../controllers/notify/NotifyController.js");
var notifyAuthController = require("../../controllers/notify/NotifyAuthController.js");

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
    // If login was successful, create new device and provide authToken and secret for future.
    else {
      // create device
      var deviceData ={
        name: req.headers['device-name'],
        user_id: user._id,
        firebaseInstance: req.headers['firebase-instance-id'],
      }

      notifyAuthController.createDevice(deviceData, function(err, device) {
        // if error saving
        if (err) {
          res.statusCode = 500; // server error.
          res.setHeader('Content-Type', 'application/json');
          res.json({'message': '[ERROR] '+err});
          res.end();
        }
        // if everything succeeded.
        else {
          // create response.
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({
            'auth-token': device.authToken,
            'secret': device.secret, // should only be sent once.
          });
          res.end();
          console.log('user logged-in via API: '+device.user);
        }
      })
    }
  });
});

/*
Retrieve user data from the authToken.
*/
router.get('/user', function(req, res) {
  notifyAuthController.getDeviceFromAuthToken(req.headers['auth-token'], function(err, device) {
    // If there was a login error:
    if (err) {
      res.statusCode = 401; // unauthorized
      res.setHeader('Content-Type', 'application/json');
      res.json({'message': err});
      res.end();
    } else if (!device) {
      res.statusCode = 500; // server error
      res.setHeader('Content-Type', 'application/json');
      res.json({'message': 'error code: 101'});
      res.end();
    }
    // If login was successful:
    else {
      // create response.
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        'email': device.user.email,
        'device-name': device.name,
      });
      res.end();
      console.log('retrieved user data via API: '+device.user._id);
    }
  });
});

/*
Log-out user. Remove token from user list.
*/
router.get('/logout', function(req, res) {
  // retrieve user from authToken.
  notifyAuthController.deleteDeviceFromAuthToken(req.headers['auth-token'], function(err) {
    // If there was a login error:
    if (err) {
      res.statusCode = 401; // unauthorized
      res.setHeader('Content-Type', 'application/json');
      res.json({'message': err});
      res.end();
    } else {
      // device was deleted from the database successfullyyy.
      res.statusCode = 200; // unauthorized
      res.setHeader('Content-Type', 'application/json');
      res.json({'message': 'logout successful'});
      res.end()

      console.log('user logged-out with authToken: '+req.headers['auth-token'])
    }
  });
});

module.exports = router;
