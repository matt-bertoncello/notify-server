var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var User = require('./User')
var uuid = require('uuid/v4');

var DeviceSchema = new mongoose.Schema({
  name: String,
  firebaseInstance: {type:String, unique:true, required:true},
  user: {type:mongoose.Schema.Types.ObjectId, required:true, ref:User},
  authToken: {type:String, unique:true, default:uuid},
  secret: {type:String, default:uuid}, // keep private.
  usedWords: [ {type:String} ], // keep private.
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
});

// On pre-save, update the 'updated' field and check if password needs to be re-hashed.
DeviceSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});



module.exports = mongoose.model('Device', DeviceSchema);
