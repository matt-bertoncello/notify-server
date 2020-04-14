var admin = require("firebase-admin");
require('dotenv').config();
var Account = require("../../models/Account");

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
clientController.send = function(notification, next) {
  // if data.firebaseTokens is empty, there is no one to send message to.
  if (notification.firebaseTokens.length == 0) {
    return next(null, {
      'responses': [],
      'successCount': 0,
      'failureCount': 0,
    });
  }

  var message = {
    notification: {
      title: notification.title,
      body: notification.message,
    },
    data: {
      notificationId: notification._id.toString(),
    },
    tokens: notification.firebaseTokens,
  };

  // if there is an extended message, add it to message data.
  if (notification.extendedMessage) {
    message.data.extendedMessage = notification.extendedMessage;
  }

  // if there is an organisation and notification group. add it to data.
  if (notification.organisation && notification.notificationGroup) {
    message.data.organisation = notification.organisation.toString(),
    message.data.notificationGroup = notification.notificationGroup.toString();
  }

  // if there is an image, attach the ROOT_URL so it can be loaded by each device.
  if (notification.image) {
    message.notification.image = process.env.ROOT_URL+'/image/'+notification.image
  }

  // Send a message to the device corresponding to the provided
  // registration token.
  admin.messaging().sendMulticast(message)
    .then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message');
      next(null, response);
    })
    .catch((error) => {
      console.log('Error sending message: '+error);
      next(error, null);
    });
}

module.exports = clientController;
