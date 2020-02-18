var express = require('express');
var router = express.Router();
var authController = require("../../controllers/AuthController.js");
var userController = require("../../controllers/UserController.js");
var clientController = require("../../controllers/client/ClientController.js");
var deviceController = require("../../controllers/client/DeviceController.js");

/*
Send response to client.
*/
function apiResponse(statusCode, json, res) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.json(json);
  res.end();
}

/*
Confirm email and password are correct.
If correct, reply with auth token.
If error, handle and reply with error.
*/
router.get('/login', function(req, res) {
  authController.attempt_login(req.headers['email'], req.headers['password'], function(err, user, loginError) {

    // If there was a login error:
    if (loginError && loginError.message) {
      console.log("[API LOGIN] "+loginError.message);
      var json = { 'message': loginError.message }; // unauthorized
      apiResponse(401, json, res);
    } else if (err || !user) {
      var json = { 'message': 'error code: 101' }; // server error
      apiResponse(500, json, res);
    }
    // If login was successful, create new device and provide authToken and secret for future.
    else {
      // create device
      var deviceData ={
        name: req.headers['device-name'],
        user_id: user._id,
        firebaseInstance: req.headers['firebase-instance-id'],
        name: req.headers['device-name'],
      };

      deviceController.createDevice(deviceData, function(err, device) {
        // if error saving
        if (err) {
          var json = { 'message': '[ERROR] '+err }; // server error
          apiResponse(500, json, res);
        }
        // if everything succeeded.
        else {
          // create response.
          var json = {
            'auth-token': device.authToken,
            'secret': device.secret, // should only be sent once.
          };
          apiResponse(200, json, res);

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
  deviceController.getDeviceFromAuthToken(req.headers['auth-token'], function(err, device) {
    // If there was a login error:
    if (err) {
      var json = { 'message': err }; // unauthorized
      apiResponse(401, json, res);
    } else if (!device) {
      var json = { 'message': 'error code: 101' }; // server error
      apiResponse(500, json, res);
    }
    // If login was successful:
    else {
      // create response.
      var json = {
        'email': device.user.email,
        'device-name': device.name,
      };
      apiResponse(200, json, res);

      console.log('retrieved user data via API: '+device.user._id);
    }
  });
});

/*
Log-out user. Remove token from user list.
*/
router.post('/logout', function(req, res) {
  // retrieve user from authToken.
  deviceController.makeDeviceInactiveFromAuthToken(req.headers['auth-token'], function(err) {
    // If there was a login error:
    if (err) {
      clientController.apiError(401, err, res) // unauthorized.
    } else {
      // device was deleted from the database successfullyyy.
      var json = {'message': 'logout successful'};
      apiResponse(200, json, res);

      console.log('user logged-out with authToken: '+req.headers['auth-token']);
    }
  });
});

/*
Update the device name.
*/
router.post('/device', function(req, res) {
  if (!req.body['Device-Name']) {
    var json = {'message': 'error code: 102'}; // did not provide device-token in body.
    apiResponse(400, json, res);
  }
  deviceController.getDeviceFromAuthToken(req.headers['auth-token'], function(err, device) {
    // If there was a login error:
    if (err) {
      var json = {'message': err}; // unauthorized.
      apiResponse(401, json, res);
    } else if (!device) {
      var json = {'message': 'error code: 101'}; // unauthorized.
      apiResponse(500, json, res);
    }
    // If login was successful:
    else {
      deviceController.updateDeviceName(device._id, req.body['Device-Name'], function(err, device) {
        if (err) {
            var json = {'message': 'error code: 103'}; // could not save device.
            apiResponse(500, json, res);
          } else {
            var json = {'message': 'updated device name successfully'}; // success.
            apiResponse(200, json, res);
          }
      });
    }
  });
});

module.exports = router;
