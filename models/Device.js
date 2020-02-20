var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var uuid = require('uuid/v4');

var DeviceSchema = new mongoose.Schema({
  name: String,
  firebaseInstance: {type:String, required:true},
  user: {type:mongoose.Schema.Types.ObjectId, required:true, ref:'User'},
  authToken: {type:String, unique:true, default:uuid},
  secret: {type:String, default:uuid}, // keep private.
  active: {type:Boolean, default:true},
  usedWords: [ {type:String} ], // keep private.
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
});

// On pre-save, update the 'updated' field and check if password needs to be re-hashed.
DeviceSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

// Make this device active, and save. next(err);
DeviceSchema.methods.makeActive = function(next) {
  this.active = true;

  this.save(function(err) {
    if (err) { next('internal server error: 406'); }
    next(null);
  });
}

// Make this device inactive, and save. next(err);
DeviceSchema.methods.makeInactive = function(next) {
  this.active = false;

  this.save(function(err) {
    if (err) { next('internal server error: 406'); }
    next(null);
  });
}

// Update this device's name
DeviceSchema.methods.updateDeviceName = function(name, next) {
  this.name = name;

  this.save(function(err) {
    if (err) { next('internal server error: 406'); }
    next(null);
  });
}

module.exports = mongoose.model('Device', DeviceSchema);
