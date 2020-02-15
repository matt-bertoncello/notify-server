var express = require('express');
var router = express.Router();
var notificationGroupController = require("../../controllers/developer/NotificationGroupController.js");
var clientController = require("../../controllers/client/ClientController.js");

/*
Send response to issuer.
*/
function apiResponse(statusCode, json, res) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.json(json);
  res.end();
}

/*
provide the following items in the header:
  organisation: organisation token
  notification-group: notification group token

provide the following items in the body:
  title:
  body:
*/
router.post('/send-notification', (req,res) => {

  // check if headers are provided.
  if (!req.headers['organisation'] || !req.headers['notification-group']) {
    var json = { 'message': 'incorrect headers provided - see docs' }; // incorrect headers provided
    apiResponse(400, json, res);
  }

  // check body is provided.
  else if (!req.body['title'] || !req.body['message']) {
    var json = { 'message': 'incorrect body provided - see docs' }; // incorrect body provided
    apiResponse(400, json, res);
  }

  // if headers are provided, attempt to retrieve the notificaiton group.
  else {
    notificationGroupController.getNotificationGroupFromIssuerTokens(req.headers['organisation'], req.headers['notification-group'],
    function(err, notificationGroup) {
      if (err) {
        var json = { 'message': 'internal error code: 401' }; // internal server error.
        apiResponse(500, json, res);
      } else if (!notificationGroup) {
        var json = { 'message': 'could not find notification group from the tokens provided - see docs' }; // internal server error.
        apiResponse(401, json, res);
      }

      // if notification group was found.
      else {
        notificationGroup.getAllFirebaseTokens(function(err, firebaseTokens) {
          var data = {
            'tokens': firebaseTokens,
            'title': req.body['title'],
            'body': req.body['message'],
          };

          clientController.send(data, function(err, response) {
            if (err) {
              var json = { 'message': 'internal server error: 402' }; // internal server error.
              apiResponse(500, json, res);
            } else {
              var json = { 'message': 'success' }; // internal server error.
              apiResponse(200, json, res);
            }
          });
        });
      }
    });
  }
});

/*
Called after 'send-notication' to retrieve data about the notification.
*/
router.get('/feedback', (req,res) => {
  res.send('test');
});

module.exports = router;
