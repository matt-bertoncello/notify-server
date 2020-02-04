var mongoose = require('mongoose');
var User = require('./User');
var User = require('./Organisation');

var NotificationSchema = new mongoose.Schema({
  title: {type:String, required:true},
  body: {type:String, required:true},
  extendedMessage: {type:String},
  organisation: {type:mongoose.Schema.Types.ObjectId, required:true, ref:Organisation},
  users: [ {type:mongoose.Schema.Types.ObjectId, required:true, ref:User} ],
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
});

// On pre-save, update the 'updated' field and check if password needs to be re-hashed.
NotificationSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

module.exports = mongoose.model('Notification', NotificationSchema);
