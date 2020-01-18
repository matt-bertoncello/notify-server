var admin = require("firebase-admin");
require('dotenv').config();

notifyController = {};

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

// This registration token comes from the client FCM SDKs.
var registrationToken = 'dCv8_Za634Y:APA91bFY8PFKWB3IlMKLfZoFvC0dXDR1RhhGEWRcfvmyZwe236JCZCCNqz6zhRL1JKYUNM0B-ySKmbNiLVnLVHEACqATBnJt9kAtQUi3KV9tmWi1nct0w0txMtn1w6wNsKfwejB38IKU';

notifyController.send = function(data) {
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
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
}

module.exports = notifyController;
