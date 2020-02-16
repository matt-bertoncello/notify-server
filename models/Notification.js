var mongoose = require('mongoose');
var clientController = require('../controllers/client/ClientController');

var NotificationSchema = new mongoose.Schema({
  title: {type:String, required:true},
  message: {type:String, required:true},
  extendedMessage: {type:String},
  organisation: {type:mongoose.Schema.Types.ObjectId, required:true, ref:'Organisation'},
  notificationGroup: {type:mongoose.Schema.Types.ObjectId, required:true, ref:'NotificationGroup'},
  firebaseTokens: [ {type:String, required:true} ],
  response: {type:Object},
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
  doc = this;

  var data = {
    'title': doc.title,
    'message': doc.message,
    'firebaseTokens': doc.firebaseTokens,
    'organisation': doc.organisation,
    'notificationGroup': doc.notificationGroup,
    'extendedMessage': doc.extendedMessage,
  };

  // send message.
  clientController.send(data, function(err, response) {
    // save response.
    doc.response = response;

    doc.save(function(err) {
      if (err) { console.log('internal server error: 405'); }
      next(null, response);
    });
  });
};

module.exports = mongoose.model('Notification', NotificationSchema);
