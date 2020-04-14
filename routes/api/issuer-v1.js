var express = require('express');
var router = express.Router();
var cors = require('cors')
var notificationGroupController = require("../../controllers/developer/NotificationGroupController.js");
var notificationController = require("../../controllers/developer/NotificationController.js");

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
router.post('/send-notification', cors(), (req,res) => {
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
            'firebaseTokens': firebaseTokens,
            'title': req.body['title'].replace(/\r?\n|\r/g, " ").trim(),
            'message': req.body['message'].replace(/\r?\n|\r/g, " ").trim(),
            'accounts': notificationGroup.accounts,

            'organisation': notificationGroup.organisation._id,
            'notificationGroup': notificationGroup._id,
          };

          // if req.body['image'] === true, display the image with the notification.
          if (req.body['image'] === true) {
            data.image = notificationGroup.displayImage;
          }

          // if req.body['extended-message'] is present, serialise and add to notification.
          if (req.body['extended-message']) {
            data.extendedMessage = req.body['extended-message'].replace(/\r?\n|\r/g, " ").trim();
          }

          notificationController.createNotification(data, function(err, notification) {
            if (err) {
              var json = { 'message': err }; // internal server error.
              apiResponse(500, json, res);
            }

            // if notification was created successfully.
            else {
              notification.send(function(err, response){
                if (err) {
                  var json = { 'message': 'internal error code: 404' }; // internal server error.
                  apiResponse(500, json, res);
                } else {
                  var json = {
                    'message': 'success',
                    'notification': notification._id,
                    'response': {
                      successCount: response.successCount,
                      failureCount: response.failureCount,
                    },
                  };
                  apiResponse(200, json, res);
                }
              });
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
