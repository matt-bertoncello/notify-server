var Account = require("../../models/Account");
var Device = require("../../models/Device");
require('dotenv').config();

deviceController = {};

/*
Create device with appropriate fields.
If device already exists, make it active. next(err, device);
*/
deviceController.createDevice = function(object, next) {
  // find device with same firebase token and account_id.
  Device.findOne({
    'firebaseInstance': object.firebaseInstance,
    'account': object.account_id,
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
        account: object.account_id,
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
  }).populate('account');
}

/*
Get account from the device referenced by authToken.
*/
deviceController.getAccountFromAuthToken = function(authToken, next) {
  deviceController.getDeviceFromAuthToken(authToken, function(err, device) {
    if (err) { next(err, null) }
    else { return next(err, device.account) }
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
Find all devices for this account.
*/
deviceController.getAllDevicesForAccount = function(account_id, next) {
  Device.find({
    'account': account_id ,
    'active': true,
  }, function(err, devices) {
    next(err, devices);
  });
}

deviceController.getDeviceFromId = function(account_id, device_id, next) {
  Device.findOne({
    'account': account_id,
    '_id': device_id,
    'active': true,
  }, function(err, device) {
    next(err, device);
  });
}

/*
Find all devices for accounts in this notificationGroup.
*/
deviceController.getAllDevicesForNotificationGroup = function(notificationGroup, next) {
  Device.find({
    'account': { $in: notificationGroup.accounts },
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
