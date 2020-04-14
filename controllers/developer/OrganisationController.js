var Organisation = require("../../models/Organisation");
var NotificationGroup = require("../../models/NotificationGroup");
var imageController = require("./ImageController.js");

var organisationController = {};

/*
Create new organisation with this account as the sole admin.
*/
organisationController.createOrganisation = function(imageLocalPath, contentType, account, organisationName, mainColour, secondaryColour, next) {
  // Create organisation.
  organisation = new Organisation({
    'name': organisationName,
    'admin': [account._id],  // make this original account an admin.
    'email': account.email,  // main contact email.
    'mainColour': mainColour,
    'secondaryColour': secondaryColour,
  });


  // upload image to DB, then link it to organisation if it was created successfully.
  imageController.saveImage(imageLocalPath, contentType, organisation._id, function(err, image){
    // if the image was uploaded successfully, allocate it to this organisation.
    if (image) {
      organisation.image = image;
    }

    // save organisation.
    organisation.save(function(err) {
      if (err) { return next(err, null); }
      else { return next(err, organisation); }
    });
  });
};

/*
Return the organisation with the organisation_id if this account is an admin or a developer. Populate image path.
*/
organisationController.getOrganisationFromId = function(account_id, organisation_id, next) {
  Organisation.findOne({
    '_id': organisation_id,
    $or: [
      {'admin': account_id},
      {'developer': account_id},
    ],
  }, function(err, organisation) {
    next(err, organisation);
  });
};

/*
Return all organisations for this account. populate image path.
*/
organisationController.getAllOrganisationsForAccount = function(account_id, next) {
  Organisation.find({
    $or: [
      {'admin': account_id}, // either an admin or developer.
      {'developer': account_id},
    ],
  }, function(err, organisations) {
    next(err, organisations);
  })
};

module.exports = organisationController;
