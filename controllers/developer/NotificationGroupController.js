var NotificationGroup = require("../../models/NotificationGroup");
var imageController = require("./ImageController.js");

var notificationGroupController = {};

/*
Return all notification groups for this organisation.
*/
notificationGroupController.getAllNotificationGroupsForOrganisation = function(organisation_id, next) {
  NotificationGroup.find({
    'organisation': organisation_id,
  }, function(err, notificationGroups) {
    next(err, notificationGroups);
  });
};

/*
Get the organisation this notificationGroup belongs to.
If the user is a developer or admin of this organisation, return the notificationGroup.
Otherwise, return an error. next(err, notificationGroup);
*/
notificationGroupController.getNotificationGroupById = function(user_id, notificationGroup_id, next) {
  NotificationGroup.findOne({
    '_id': notificationGroup_id,
  }, function(err, notificationGroup) {
    if (err) { return next(err,null); }
    else if (!notificationGroup) { return next('no notificationGroup found',null) }
    else {
      // get the role of this user in the organisation.
      var role = notificationGroup.organisation.getUserRole(user_id);
      // if the user is authorised:
      if (role === 'admin' || role == 'developer') {
        return next(null, notificationGroup);
      }
      else { return next('not part of this organisation', null); }
    }
  }).populate('users');
};

notificationGroupController.createNotificationGroup = function(organisation_id, notificationGroupData, next) {
  // Create organisation.
  notificationGroup = new NotificationGroup({
    'name': notificationGroupData.name,
    'description': notificationGroupData.description,
    'organisation': organisation_id,
    'users': [],
  });

  // if image exists, upload image to DB, then link it to organisation if it was created successfully.
  if (notificationGroupData.imagePath) {
    imageController.saveImage(notificationGroupData.imagePath, organisation_id, function(err, image){
      // if the image was uploaded successfully, allocate it to this organisation.
      if (image) {
        notificationGroup.image = image._id;
      }

      // save notificationGroup.
      notificationGroup.save(function(err) {
        if (err) { return next(err, null); }
        else { return next(err, notificationGroup); }
      });
    });
  } else {
    // save notificationGroup.
    notificationGroup.save(function(err) {
      if (err) { return next(err, null); }
      else { return next(err, notificationGroup); }
    });
  }
};

module.exports = notificationGroupController;
