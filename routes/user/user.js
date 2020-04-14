var express = require('express');
var router = express.Router();
var accountController = require("../../controllers/AccountController.js")
var authController = require("../../controllers/AuthController.js");
var deviceController = require("../../controllers/client/DeviceController.js");
var notificationController = require("../../controllers/developer/NotificationController.js");

/* Title page */
router.get('/', accountController.updateAccount, (req,res) => {
  res.render('user/title', {req: req});
});

/* Dashboard */
router.get('/dashboard', authController.checkAuthentication, (req,res) => {
  res.render('user/dashboard', {req: req});
});

/*
Display all of account's devices. If error, redirect to dashboard.
*/
router.get('/devices',authController.checkAuthentication, (req,res) => {
  deviceController.getAllDevicesForAccount(req.session.passport.user._id, function(err, devices) {
    if (err) {
      console.log(err);
      res.redirect('/user');
    } else {
      res.render('user/devices', {req: req, devices: devices});
    }
  })
});

/*
Send manual notification to account's device.
*/
router.get('/devices/:device', authController.checkAuthentication, (req,res) => {
  deviceController.getDeviceFromId(req.session.passport.user._id, req.params.device, function(err, device) {
    if (err) {
      res.redirect('/user/devices');
    } else if (!device) {
      console.log('[ERROR] no device found');
      res.redirect('/user/devices');
    } else {
      res.render('user/send', {req: req, device: device});
    }
  })
});

/* Notifications */
router.get('/notifications', authController.checkAuthentication, (req,res) => {
  // get all notifications sent to this account.
  notificationController.getAllNotificationsForAccount(req.session.passport.user._id, function(err, notifications) {
    if (err) { res.redirect('/user'); }
    else {
      res.render('user/notifications', {req: req, notifications: notifications});
    }
  });
});

module.exports = router;
