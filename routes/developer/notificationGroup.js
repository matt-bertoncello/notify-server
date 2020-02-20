var express = require('express');
var router = express.Router();
var imageController = require("../../controllers/developer/ImageController.js");
var notificationGroupController = require("../../controllers/developer/NotificationGroupController.js");
var notificationController = require("../../controllers/developer/NotificationController.js");

/* Retrieved image indexed by 'image' */
router.get('/:notificationGroup', (req,res) => {
  notificationGroupController.getNotificationGroupById(req.session.passport.user._id, req.params.notificationGroup, function(err, notificationGroup) {
    if (err || !notificationGroup) {
      res.redirect('/developer');
    } else {
      res.render('developer/notificationGroup/dashboard', {req: req, notificationGroup: notificationGroup});
    }
  });
});

/* Retrieved image indexed by 'image' */
router.get('/:notificationGroup/notifications', (req,res) => {
  notificationGroupController.getNotificationGroupById(req.session.passport.user._id, req.params.notificationGroup, function(err, notificationGroup) {
    if (err || !notificationGroup) {
      res.redirect('/developer');
    }

    // if notification group was found successfully.
    else {
      // get all notifications for this notification group.
      notificationController.getAllNotificationsForNotificationGroup(notificationGroup._id, function(err, notifications) {
        if (err) { res.redirect('/developer'); }
        else {
          res.render('developer/notificationGroup/notifications', {req: req, notifications: notifications, notificationGroup: notificationGroup});
        }
      });
    }
  });
});

module.exports = router;
