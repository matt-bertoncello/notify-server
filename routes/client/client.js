var express = require('express');
var router = express.Router();
var authController = require("../../controllers/AuthController.js");
var deviceController = require("../../controllers/client/DeviceController.js");
var notificationController = require("../../controllers/developer/NotificationController.js");

/* Dashboard */
router.get('/', authController.checkAuthentication, (req,res) => {
  res.render('client/dashboard', {req: req});
});

/*
Display all of user's devices. If error, redirect to dashboard.
*/
router.get('/devices',authController.checkAuthentication, (req,res) => {
  deviceController.getAllDevicesForUser(req.session.passport.user._id, function(err, devices) {
    if (err) {
      console.log(err);
      res.redirect('/client');
    } else {
      res.render('client/devices', {req: req, devices: devices});
    }
  })
});

/*
Send manual notification to user's device.
*/
router.get('/devices/:device', authController.checkAuthentication, (req,res) => {
  deviceController.getDeviceFromId(req.session.passport.user._id, req.params.device, function(err, device) {
    if (err) {
      res.redirect('/client/devices');
    } else if (!device) {
      console.log('[ERROR] no device found');
      res.redirect('/client/devices');
    } else {
      res.render('client/send', {req: req, device: device});
    }
  })
});

/* Notifications */
router.get('/notifications', authController.checkAuthentication, (req,res) => {
  // get all notifications sent to this user.
  notificationController.getAllNotificationsForUser(req.session.passport.user._id, function(err, notifications) {
    if (err) { res.redirect('/client'); }
    else {
      res.render('client/notifications', {req: req, notifications: notifications});
    }
  });
});

module.exports = router;
