var authController = require('../../controllers/AuthController');
var userController = require('../../controllers/UserController');
var notificationGroupController = require('../../controllers/developer/NotificationGroupController');

socket_router = {};

socket_router.sock = function(socket, io) {

  /*
  Confirm this user is in notificationGroup.
  Add user to notification group via email. Confirm user exists.
  data = { email, notificationGroup }
  */
  socket.on('addEmailToNotificationGroup', function(data) {

    // if text is not a valid email.
    if (!authController.isEmail(data.email)) {
      socket.emit('failure', {'message':'Not a valid email.'});
    }

    // else check if email is a valid user.
    else {
      userController.getUserFromEmail(data.email, function(err, user) {
        // if error.
        if (err) { socket.emit('failure', {'message':err}); }
        // if no error, but user doesn't exist.
        else if (!user) { socket.emit('failure', {'message':'could not find user'}); }
        // if valid user
        else if (user) {
          // add user to notification group.
          notificationGroupController.getNotificationGroupById(socket.handshake.session.passport.user._id, data.notificationGroup, function(err, notificationGroup) {
            // if error.
            if (err) { socket.emit('failure', {'message':err}); }
            // if no error, but notificationGroup doesn't exist.
            else if (!user) { socket.emit('failure', {'message':'could not find notificationGroup'}); }
            // if valid notificationGroup
            notificationGroup.addUser(user._id, function(err){
              if (err) { socket.emit('failure', {'message':err}); }
              else {
                // send successful message to client.
                socket.emit('add-success', {'email':data.email} );
              }
            });
          });
        }
      });
    }
  });

  /*
  Confirm this user is in notificationGroup.
  Remove user from this notificationGroup.
  data = { email, notificationGroup }
  */
  socket.on('removeEmailFromNotificationGroup', function(data) {

    // if text is not a valid email.
    if (!authController.isEmail(data.email)) {
      socket.emit('failure', {'message':'Not a valid email.'});
    }

    // else check if email is a valid user.
    else {
      userController.getUserFromEmail(data.email, function(err, user) {
        // if error.
        if (err) { socket.emit('failure', {'message':err}); }
        // if no error, but user doesn't exist.
        else if (!user) { socket.emit('failure', {'message':'could not find user'}); }
        // if valid user
        else if (user) {
          // add user to notification group.
          notificationGroupController.getNotificationGroupById(socket.handshake.session.passport.user._id, data.notificationGroup, function(err, notificationGroup) {
            // if error.
            if (err) { socket.emit('failure', {'message':err}); }
            // if no error, but notificationGroup doesn't exist.
            else if (!user) { socket.emit('failure', {'message':'could not find notificationGroup'}); }
            // if valid notificationGroup
            notificationGroup.removeUser(user._id, function(err){
              if (err) { socket.emit('failure', {'message':err}); }
              else {
                // send successful message to client.
                socket.emit('remove-success', {'email':data.email} );
              }
            });
          });
        }
      });
    }
  });
}

module.exports = socket_router;
