var User = require("../../models/User");
var Device = require("../../models/Device");
require('dotenv').config();

deviceController = {};

/*
Create device with appropriate fields.
If device already exists, make it active. next(err, device);
*/
deviceController.createDevice = function(object, next) {
  // find device with same firebase token and user_id.
  Device.findOne({
    'firebaseInstance': object.firebaseInstance,
    'user': object.user_id,
  }, function(err, device) {
    if (err) { return next(err, null); }

    // if device exists, update name and make it active.
    else if (device) {
      device.makeActive(function(err) {
        device.updateDeviceName(object.name, function(err) {
          next(null, device);
        })
      })
    }

    // else if device doesn't exist.
    else {
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
  });
}

/*
Get device from authToken.
*/
deviceController.getDeviceFromAuthToken = function(authToken, next) {
  Device.findOne({
    'authToken': authToken,
    'active': true,
  }, function(err, device) {
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
deviceController.getUserFromAuthToken = function(authToken, next) {
  deviceController.getDeviceFromAuthToken(authToken, function(err, device) {
    if (err) { next(err, null) }
    else { return next(err, device.user) }
  });
}

/*
Make device inactive from auth token.
*/
deviceController.makeDeviceInactiveFromAuthToken = function(authToken, next) {
  deviceController.getDeviceFromAuthToken(authToken, function(err, device) {
    if (err) { next(err, null) }
    else {
      device.makeInactive(function(err) {
        return next(err);
      });
    }
  });
}

/*
Update the device name in the DB, from id.
*/
deviceController.updateDeviceName = function(device_id, name, next) {
  Device.findOne({'_id':device_id}, function(err, device) {
    device.updateDeviceName(name, function(err) {
      next(err, device);
    });
  });
};

/*
Find all devices for this user.
*/
deviceController.getAllDevicesForUser = function(user_id, next) {
  Device.find({
    'user': user_id ,
    'active': true,
  }, function(err, devices) {
    next(err, devices);
  });
}

deviceController.getDeviceFromId = function(user_id, device_id, next) {
  Device.findOne({
    'user': user_id,
    '_id': device_id,
    'active': true,
  }, function(err, device) {
    next(err, device);
  });
}

/*
Find all devices for users in this notificationGroup.
*/
deviceController.getAllDevicesForNotificationGroup = function(notificationGroup, next) {
  Device.find({
    'user': { $in: notificationGroup.users },
    'active': true,
  }, function(err, devices) {
    // remove duplicate devices (should never appear. better to be safe than sorry).
    var indexes = []
    for (var i=0; i<devices.length; i++) {
      for (var j=i+1; j<devices.length; j++) {
        if (i !== j && devices[i]._id === devices[j]._id) {
          indexes.push(j);  // found a duplicate.
        }
      }
    }

    // remove the duplicates.
    // https://stackoverflow.com/questions/9425009/remove-multiple-elements-from-array-in-javascript-jquery
    while(indexes.length) {
      devices.splice(indexes.pop(), 1);
    }

    next(err, devices);
  });
}

module.exports = deviceController;
