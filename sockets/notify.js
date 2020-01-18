var notifyController = require('../controllers/notify/NotifyController');

socket_router = {}

socket_router.sock = function(socket, io) {

  socket.on('send', function(data) {
    notifyController.send(data);
  });
}

module.exports = socket_router;
