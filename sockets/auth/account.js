var authController = require('../../controllers/AuthController');
var accountController = require('../../controllers/AccountController');
var passport = require('passport');

socket_router = {}

socket_router.sock = function(socket, io) {

  /*
  Will check if data.newPassword1 is the same as data.newPassword2,
  then update/set the account's password if they are the same.
  This is called in set and update password socket calls.
  */
  function setPassword(data, account) {
    // If the newPasswords are not the same, throw error;
    if (data.newPassword1 != data.newPassword2) {socket.emit('err', {id: 'password_error', text: "New passwords are not the same."});}
    // If the two new passwords are the same, set password to the new password.
    else {
      account.updatePassword(data.newPassword1, function(err, completed){
        if (err) {socket.emit('err', {id: 'password_error', text: err});}
        // if password was updated successfully, refresh page.
        else {
          authController.updatedPassword = true;  // handled by /account in index.js.
          socket.emit('redirect', '/account');
        }
      });
    }
  }

  socket.on('update_password', function(data) {
    accountController.getAccount(socket.handshake.session.passport.user._id, function(err, account) {
      // If there was an error finding the account, redirect to home screen;
      if (err) {socket.emit('redirect', '/');}
      // Else, check old password is correct.
      else {
        account.comparePassword(data.oldPassword, function(err, isMatch) {
          // throw error if there was an issue comparing passwords.
          if (err) {socket.emit('err', {id: 'password_error', text: err});}
          // if oldPassword does not match with saved password
          else if (!isMatch) {socket.emit('err', {id: 'password_error', text: "Current password is incorrect."});}
          // if old password is correct and the new passwords are the same, update the account's password.
          else if (isMatch) {
            setPassword(data, account);
          }
        });
      }
    });
  });

  socket.on('set_password', function(data) {
    accountController.getAccount(socket.handshake.session.passport.user._id, function(err, account) {
      // If there was an error finding the account, redirect to home screen;
      if (err) {socket.emit('redirect', '/');}
      // Else, check new passwords are correct and set new password.
      else {
        setPassword(data, account);
      }
    });
  });
}

module.exports = socket_router;
