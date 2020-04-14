var mongoose = require('mongoose');
var clientController = require('../controllers/client/ClientController');
var clonedeep = require('clonedeep');

var NotificationSchema = new mongoose.Schema({
  title: {type:String, required:true},
  message: {type:String, required:true},
  image: {type:String, ref:'Image'},
  extendedMessage: {type:String},
  organisation: {type:mongoose.Schema.Types.ObjectId, required:true, ref:'Organisation'},
  notificationGroup: {type:mongoose.Schema.Types.ObjectId, required:true, ref:'NotificationGroup'},
  accounts: [ {type:mongoose.Schema.Types.ObjectId, required:true, ref:'Account'} ],
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

  // send message.
  clientController.send(clonedeep(doc), function(err, response) {
    // save response.
    doc.response = response;

    doc.save(function(err) {
      if (err) { console.log('internal server error: 405'); }
      next(null, response);
    });
  });
};

module.exports = mongoose.model('Notification', NotificationSchema);
