var mongoose = require('mongoose');
var uuid = require('uuid/v4');
var passportLocalMongoose = require('passport-local-mongoose');
var deviceController = require('../controllers/client/DeviceController');

var NotificationGroupSchema = new mongoose.Schema({
  name: {type:String, required:true},
  description: {type:String, required:true},
  organisation: {type:mongoose.Schema.Types.ObjectId, required:true, ref:'Organisation'},
  accounts: [{type:mongoose.Schema.Types.ObjectId, required:true, ref:'Account'}],
  image: {type:String, ref:'Image'},
  token: {type: String, unique:true, default: uuid},
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
});

/*
On pre-save, update the 'updated' field and check if password needs to be re-hashed.
Needs to have organisation populated.
*/
NotificationGroupSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

// called pre find and pre findOne to populate organisation.
var autoPopulateOrganisation = function(next) {
  this.populate('organisation');
  next();
};

// populate organisation every time this is initialised
NotificationGroupSchema.
  pre('findOne', autoPopulateOrganisation).
  pre('find', autoPopulateOrganisation);

// After initialised by a find. populate the organisation and imagePath attributes.
NotificationGroupSchema.post('init', function(doc) {
  // if this notification group has an image, populate image and return the image.
  if (doc.image) {
    doc.displayImage = doc.image;
  }

  // else, populate the organisation and their
  else if (doc.organisation.image) {
    doc.displayImage = doc.organisation.image;
  }

  else {
    doc.displayImage = null;
  }

});

/*
Add account to notification group then run next(err);
*/
NotificationGroupSchema.methods.addAccount = function(account_id, next) {

  for (var i=0; i<this.accounts.length; i++) {
    if (this.accounts[i]._id.toString().trim() === account_id.toString().trim()) {
      return next('account is already subscribed to this notification group.');
    }
  }

  this.accounts.push(account_id);

  this.save(function(err){
    return next(err);
  });
};

/*
Remove account to notification group then run next(err);
*/
NotificationGroupSchema.methods.removeAccount = function(account_id, next) {
  // iterate over each account.
  for (var i=0; i<this.accounts.length; i++) {
    // if this is the account
    if (this.accounts[i]._id.toString().trim() === account_id.toString().trim()) {
      // remove account and save.
      this.accounts.splice(i, 1);
      this.save(function(err){
        return next(err);
      });
    }
  }

  return next(null);
};

/*
Rename notification group then run next(err);
*/
NotificationGroupSchema.methods.rename = function(name, next) {
  this.name = name;

  this.save(function(err){
    return next(err);
  });
};

/*
Remove image from this notification group. next(err).
*/
NotificationGroupSchema.methods.deleteImage = function(name, next) {
  delete this.image;

  this.save(function(err){
    return next(err);
  });
};

/*
Get all firebase tokens of accounts in this notification group.
These firebase tokens will be used as notification endpoints.
return next(err, firebaseTokens);
*/
NotificationGroupSchema.methods.getAllFirebaseTokens = function(next) {
  // get all devices from each account.
  deviceController.getAllDevicesForNotificationGroup(this, function(err, devices) {
    if (err) { return next(err, null); }
    else {
      var firebaseTokens = [];
      for (var i=0; i<devices.length; i++){
        firebaseTokens.push(devices[i].firebaseInstance);
      }
      return next(null, firebaseTokens);
    }
  });
};

module.exports = mongoose.model('NotificationGroup', NotificationGroupSchema);
