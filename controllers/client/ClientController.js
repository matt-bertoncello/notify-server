var admin = require("firebase-admin");
require('dotenv').config();
var User = require("../../models/User");

clientController = {};

admin.initializeApp({
  credential: admin.credential.cert({
  'type': process.env.FIREBASE_TYPE,
  'project_id': process.env.FIREBASE_PROJECT_ID,
  'private_key_id': process.env.FIREBASE_PRIVATE_KEY_ID,
  'private_key': process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  'client_email': process.env.FIREBASE_CLIENT_EMAIL,
  'client_id': process.env.FIREBASE_CLIENT_ID,
  'auth_uri': process.env.FIREBASE_AUTH_URI,
  'token_uri': process.env.FIREBASE_TOKEN_URI,
  'auth_provider_x509_cert_url': process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  'client_x509_cert_url': process.env.FIREBASE_X509_CERT_URL
}
),
  databaseURL: process.env.FIREBASE_DB
});
console.log('[INFO] Connected Notify to Firebase');

/*
Send notification with title and body to token.
*/
clientController.send = function(data, next) {
  var message = {
    notification: {
      title: data.title,
      body: data.body,
    },
    token: data.token
  };

  console.log(message);

  // Send a message to the device corresponding to the provided
  // registration token.
  admin.messaging().send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
      next(null, response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
      next(error, null);
    });
}

/*
Add this firebase token to list of user's tokens.
Each token refers to a unique mobile device.
When Notify is triggered to send to this user, all tokens will be sent.
*/
clientController.allocateFirebaseTokenToUser = function(user, token, next) {
  // find all other users that contain this token and delete that token.
  User.find({
    'notify.firebaseInstances': token,
    '_id': {$ne: user._id}
  }, function(err, returned_users) {
    if (err) {
      next(err, false);
    }
    for (var i=0; i<returned_users.length; i++) {
      returned_users[i].notify.firebaseInstances = returned_users[i].notify.firebaseInstances.filter(function(value, index, arr){
        return value != token;
      });
      returned_users[i].save(function(err) {
        if (err) {return next(err, false);}
      });
    }

    // if token is not already saved in array, push to array.
    if (!user.notify.firebaseInstances.includes(token)) {
      user.notify.firebaseInstances.push(token);

      user.save(function(err) {
        if (err) {return next(err, false);}
        else {
          console.log("added firebase instance: "+token);
          return next(null, true);
        }
      });
    } else {
      return next(null, true);
    }
  });
}

module.exports = clientController;
