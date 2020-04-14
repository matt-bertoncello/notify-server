var Notification = require("../../models/Notification");
var imageController = require("./ImageController.js");

var notificationController = {};

/*
Data is an object containing title, message, firebaseTokens
*/
notificationController.createNotification = function(data, next) {
  // check necessary data.
  if (!data.title || !data.message || !data.firebaseTokens || !data.organisation || !data.notificationGroup || !data.accounts) {
    return next('internal error 403', null);
  }

  // if all data is present.
  else {
    // create new notification.
    notification = new Notification(data);

    // save notification.
    notification.save(function(err) {
      if (err) { return next(err, null); }
      else { return next(err, notification); }
    });
  }
};

// retrieve all notifications sent to this account group.
notificationController.getAllNotificationsForNotificationGroup = function(notificationGroup_id, next) {
  Notification.find({
    'notificationGroup': notificationGroup_id,
  }, function(err, notifications) {
    next(err, notifications);
  }).populate('organisation').sort({ created : 'descending'});
};

// retrieve all notifications sent to this account.
notificationController.getAllNotificationsForAccount = function(account_id, next) {
  Notification.find({
    'accounts': account_id,
  }, function(err, notifications) {
    next(err, notifications);
  }).populate('organisation').sort({ created : 'descending'});
};

module.exports = notificationController;
