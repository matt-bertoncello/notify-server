var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var User = require('./Organisation');

var NotificationGroupSchema = new mongoose.Schema({
  name: String,
  organisation: {type:mongoose.Schema.Types.ObjectId, required:true, ref:Organisation},
  users: [{type:mongoose.Schema.Types.ObjectId, required:true, ref:User}],
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
});

// On pre-save, update the 'updated' field and check if password needs to be re-hashed.
NotificationGroupSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

module.exports = mongoose.model('NotificationGroup', NotificationGroupSchema);
