var Notification = require("../../models/Notification");
var imageController = require("./ImageController.js");

var notificationController = {};

/*
Data is an object containing title, message, firebaseTokens
*/
notificationController.createNotification = function(data, next) {
  // check necessary data.
  if (!data.title || !data.message || !data.firebaseTokens || !data.organisation || !data.notificationGroup) {
    return next('internal error 403', null);
  }

  // if all data is present.
  else {
    // create new notification.
    notification = new Notification({
      'title': data.title,
      'message': data.message,
      'firebaseTokens': data.firebaseTokens,
      'organisation': data.organisation,
      'notificationGroup': data.notificationGroup,
      'extendedMessage': data.extendedMessage,
      'image': data.image,
    });

    // save notification.
    notification.save(function(err) {
      if (err) { return next(err, null); }
      else { return next(err, notification); }
    });
  }
};

module.exports = notificationController;
