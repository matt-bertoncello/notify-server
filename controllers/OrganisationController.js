var Organisation = require("../models/Organisation");
var NotificationGroup = require("../models/NotificationGroup");
var imageController = require("./ImageController.js");
var uuid = require("uuid/v4");

var organisationController = {};

/*
Create new organisation with this user as the sole admin.
*/
organisationController.createOrganisation = function(imageLocalPath, user, organisationName, mainColour, secondaryColour, next) {
  // Create organisation.
  organisation = new Organisation({
    'name': organisationName,
    'admin': [user._id],  // make this original user an admin.
    'email': user.email,  // main contact email.
    'mainColour': mainColour,
    'secondaryColour': secondaryColour,
  });


  // upload image to DB, then link it to organisation if it was created successfully.
  imageController.saveImage(imageLocalPath, organisation._id, function(err, image){
    // if the image was uploaded successfully, allocate it to this organisation.
    if (image) {
      organisation.image = image._id;
    }

    // save organisation.
    organisation.save(function(err) {
      if (err) { return next(err, null); }
      else { return next(err, organisation); }
    });
  });
};

/*
Return the organisation with the organisation_id if this user is an admin or a developer. Populate image path.
*/
organisationController.getOrganisationFromId = function(user_id, organisation_id, next) {
  Organisation.findOne({
    '_id': organisation_id,
    $or: [
      {'admin': user_id},
      {'developer': user_id},
    ],
  }, function(err, organisation) {
    next(err, organisation);
  }).populate('image', 'path');
};

/*
Return all organisations for this user. populate image path.
*/
organisationController.getAllOrganisationsForUser = function(user_id, next) {
  Organisation.find({
    $or: [
      {'admin': user_id}, // either an admin or developer.
      {'developer': user_id},
    ],
  }, function(err, organisations) {
    next(err, organisations);
  }).populate('image', 'path'); // populate image path.
};

/*
Return all notification groups for this organisation.
*/
organisationController.getAllNotificationGroups = function(organisation_id, next) {
  NotificationGroup.findOne({
    'organisation': organisation_id,
  }, function(err, notificationGroup) {
    next(err, notificationGroup);
  });
};

module.exports = organisationController;
