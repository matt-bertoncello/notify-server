var mongoose = require('mongoose');
var clientController = require('../controllers/client/ClientController');

var NotificationSchema = new mongoose.Schema({
  title: {type:String, required:true},
  message: {type:String, required:true},
  extendedMessage: {type:String},
  organisation: {type:mongoose.Schema.Types.ObjectId, required:true, ref:'Organisation'},
  notificationGroup: {type:mongoose.Schema.Types.ObjectId, required:true, ref:'NotificationGroup'},
  firebaseTokens: [ {type:String, required:true} ],
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
});

// On pre-save, update the 'updated' field and check if password needs to be re-hashed.
NotificationSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

// send this notification.
NotificationSchema.methods.send = function(next) {
  var data = {
    'title': this.title,
    'message': this.message,
    'firebaseTokens': this.firebaseTokens,
    'organisation': this.organisation,
    'notificationGroup': this.notificationGroup,
    'extendedMessage': this.extendedMessage,
  };

  // send message.
  clientController.send(data, function(err, response) {
    next(err, response);
  });
};

module.exports = mongoose.model('Notification', NotificationSchema);
