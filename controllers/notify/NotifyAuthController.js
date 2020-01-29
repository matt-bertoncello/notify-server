var User = require("../../models/User");
var Device = require("../../models/Device");
require('dotenv').config();

notifyAuthController = {};

/*
Create device with appropriate fields.
*/
notifyAuthController.createDevice = function(object, next) {
  var device = new Device({
    name: object.name,
    user: object.user_id,
    firebaseInstance: object.firebaseInstance,
  });

  // if there is an error saving, pass-through error.
  device.save(function(err) {
    next(err, device);
  });
}

/*
Get device from authToken.
*/
notifyAuthController.getDeviceFromAuthToken = function(authToken, next) {
  Device.findOne({ 'authToken': authToken}, function(err, device) {
    if (err) { return next(err, null) }
    if (!device) {
      err = "[ERROR] no device found with authToken: "+authToken;
    }
    return next(err, device);
  }).populate('user');
}

/*
Get user from the device referenced by authToken.
*/
notifyAuthController.getUserFromAuthToken = function(authToken, next) {
  notifyAuthController.getDeviceFromAuthToken(authToken, function(err, device) {
    if (err) { next(err, null) }
    else { return next(err, device.user) }
  });
}

/*
Delete the device identified by authToken.
*/
notifyAuthController.deleteDeviceFromAuthToken = function(authToken, next) {
  Device.deleteOne({ 'authToken': authToken }, function(err) {
    next(err)
  });
}

/*
Update the device name in the DB.
*/
notifyAuthController.updateDeviceName = function(device_id, name, next) {
  Device.findOneAndUpdate({'_id':device_id}, {$set: {'name': name}}, {'returnNewDocument': true}, function(err, device) {
    next(err, device);
  });
};

module.exports = notifyAuthController;
