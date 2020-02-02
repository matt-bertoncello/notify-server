var Organisation = require("../models/Organisation");
var imageController = require("./ImageController.js");

var organisationController = {};

/*
Create new organisation with this user as the sole admin.
*/
organisationController.createOrganisation = function(localPath, user, name, next) {
  // Save
  imageController.saveImage(user, imageData, function(err, image){
    organisation = new Organisation({
      'name': name,
      'image': image,
      'admin': [user._id],
      'email': user.email,
    });
    organisation.save(function(err) {
      if (err) { return next(err, null); }
      else { return next(err, organisation); }
    });
  });
};

/*
Return the organisation with the organisation_id if this user is an admin or a developer.
*/
organisationController.getOrganisationFromId = function(user_id, organisation_id, next) {
  Organisation.findOne({
    '_id': organisation_id,
    $or: [
      {'admin': user_id},
      {'developer': user_id}
    ],
  }, function(err, organisation) {
    next(err, organisation);
  });
};

module.exports = organisationController;
