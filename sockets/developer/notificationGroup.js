var authController = require('../../controllers/AuthController');
var accountController = require('../../controllers/AccountController');
var notificationGroupController = require('../../controllers/developer/NotificationGroupController');

socket_router = {};

socket_router.sock = function(socket, io) {

  /*
  Confirm this account is in notificationGroup.
  Add account to notification group via email. Confirm account exists.
  data = { email, notificationGroup }
  */
  socket.on('addEmailToNotificationGroup', function(data) {

    // if text is not a valid email.
    if (!authController.isEmail(data.email)) {
      socket.emit('failure', {'message':'Not a valid email.'});
    }

    // else check if email is a valid account.
    else {
      accountController.getAccountFromEmail(data.email, function(err, account) {
        // if error.
        if (err) { socket.emit('failure', {'message':err}); }
        // if no error, but account doesn't exist.
        else if (!account) { socket.emit('failure', {'message':'could not find account'}); }
        // if valid account
        else if (account) {
          // add account to notification group.
          notificationGroupController.getNotificationGroupById(socket.handshake.session.passport.user._id, data.notificationGroup, function(err, notificationGroup) {
            // if error.
            if (err) { socket.emit('failure', {'message':err}); }
            // if no error, but notificationGroup doesn't exist.
            else if (!account) { socket.emit('failure', {'message':'could not find notificationGroup'}); }
            // if valid notificationGroup
            notificationGroup.addAccount(account._id, function(err){
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
  Confirm this account is in notificationGroup.
  Remove account from this notificationGroup.
  data = { email, notificationGroup }
  */
  socket.on('removeEmailFromNotificationGroup', function(data) {

    // if text is not a valid email.
    if (!authController.isEmail(data.email)) {
      socket.emit('failure', {'message':'Not a valid email.'});
    }

    // else check if email is a valid account.
    else {
      accountController.getAccountFromEmail(data.email, function(err, account) {
        // if error.
        if (err) { socket.emit('failure', {'message':err}); }
        // if no error, but account doesn't exist.
        else if (!account) { socket.emit('failure', {'message':'could not find account'}); }
        // if valid account
        else if (account) {
          // add account to notification group.
          notificationGroupController.getNotificationGroupById(socket.handshake.session.passport.user._id, data.notificationGroup, function(err, notificationGroup) {
            // if error.
            if (err) { socket.emit('failure', {'message':err}); }
            // if no error, but notificationGroup doesn't exist.
            else if (!account) { socket.emit('failure', {'message':'could not find notificationGroup'}); }
            // if valid notificationGroup
            notificationGroup.removeAccount(account._id, function(err){
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
