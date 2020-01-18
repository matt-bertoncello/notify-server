var authController = require('../../controllers/AuthController');
var userController = require('../../controllers/UserController');
var passport = require('passport');

socket_router = {}

socket_router.sock = function(socket, io) {

  /*
  Will check if data.newPassword1 is the same as data.newPassword2,
  then update/set the user's password if they are the same.
  This is called in set and update password socket calls.
  */
  function setPassword(data, user) {
    // If the newPasswords are not the same, throw error;
    if (data.newPassword1 != data.newPassword2) {socket.emit('err', {id: 'password_error', text: "New passwords are not the same."});}
    // If the two new passwords are the same, set password to the new password.
    else {
      user.updatePassword(data.newPassword1, function(err, completed){
        if (err) {socket.emit('err', {id: 'password_error', text: err});}
        // if password was updated successfully, refresh page.
        else {
          authController.updatedPassword = true;  // handled by /user in index.js.
          socket.emit('redirect', '/user');
        }
      });
    }
  }

  socket.on('update_username', function(username) {
    if (username === "") {  // if there is no username provided, emit error
      socket.emit('err', {id: 'username_error', text: 'Cannot provide an empty username.'});
    } else if (authController.isEmail(username)) { // username cannot be an email
      socket.emit('err', {id: 'username_error', text: 'Username cannot be an email.'});
    } else {
      userController.updateUsername(socket.handshake.session.passport.user._id, username, function(err) {
        if (err && err.code === 11000) {
          socket.emit('err', {id: 'username_error', text: 'This username is already taken.'});
        } else {
          if (userController.postLoginRedirect) { // If the user was sent to to update username. Send back to original page.
            socket.emit('redirect', userController.postLoginRedirect);
            delete userController.postLoginRedirect;  // Delete postLoginRedirect now that user has returned to page.
          } else {
            socket.emit('redirect', '/user');
          }
        }
      });
    }
  });

  socket.on('update_password', function(data) {
    userController.getUser(socket.handshake.session.passport.user._id, function(err, user) {
      // If there was an error finding the user, redirect to home screen;
      if (err) {socket.emit('redirect', '/');}
      // Else, check old password is correct.
      else {
        user.comparePassword(data.oldPassword, function(err, isMatch) {
          // throw error if there was an issue comparing passwords.
          if (err) {socket.emit('err', {id: 'password_error', text: err});}
          // if oldPassword does not match with saved password
          else if (!isMatch) {socket.emit('err', {id: 'password_error', text: "Current password is incorrect."});}
          // if old password is correct and the new passwords are the same, update the user's password.
          else if (isMatch) {
            setPassword(data, user);
          }
        });
      }
    });
  });

  socket.on('set_password', function(data) {
    userController.getUser(socket.handshake.session.passport.user._id, function(err, user) {
      // If there was an error finding the user, redirect to home screen;
      if (err) {socket.emit('redirect', '/');}
      // Else, check new passwords are correct and set new password.
      else {
        setPassword(data, user);
      }
    });
  });
}

module.exports = socket_router;
