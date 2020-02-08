

socket_router = {}

socket_router.sock = function(socket, io) {

  /*
  Add user to notification group via email.
  data = {
    email
  }
  */
  socket.on('add', function(data) {
    console.log(socket.handshake.url);
  });
}

module.exports = socket_router;
