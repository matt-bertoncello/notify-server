var notifyController = require('../controllers/notify/NotifyController');
var notifyDeviceController = require('../controllers/notify/notifyDeviceController');

socket_router = {}

socket_router.sock = function(socket, io) {

  /*
  Send from browser. Find firebaseInstance and send notification with title and body.
  Send error or success message as appropriate.
  */
  socket.on('send', function(data) {
    notifyDeviceController.getDeviceFromId(socket.handshake.session.passport.user._id, data._id, function(err, device) {
      if (err) { socket.emit('err', {id: 'send_error', text: err}); } // error thrown by notifyCotroller.
      else if (!device) { // if no device was returned by notifyCotroller.
        var message = 'server error 301';
        socket.emit('err', {id: 'send_error', text: message });
      } else {
        // if device was found successfully, send message.
        notifyController.send({
          'token': device.firebaseInstance,
          'title': data.title,
          'body': data.body,
        }, function(err, message_id) {
          if (err) { socket.emit('err', {id: 'send_error', text: err}); }
          else { socket.emit('err', {id: 'send_success', text: 'success'}); }
        });
      }
    });
  });
}

module.exports = socket_router;
