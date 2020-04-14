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
If the account is a developer or admin of this organisation, return the notificationGroup.
Otherwise, return an error. next(err, notificationGroup);
*/
notificationGroupController.getNotificationGroupById = function(account_id, notificationGroup_id, next) {
  NotificationGroup.findOne({
    '_id': notificationGroup_id,
  }, function(err, notificationGroup) {
    if (err) { return next(err,null); }
    else if (!notificationGroup) { return next('no notificationGroup found',null) }
    else {
      // get the role of this account in the organisation.
      var role = notificationGroup.organisation.getAccountRole(account_id);
      // if the account is authorised:
      if (role === 'admin' || role == 'developer') {
        return next(null, notificationGroup);
      }
      else { return next('not part of this organisation', null); }
    }
  }).populate('accounts');
};

notificationGroupController.createNotificationGroup = function(organisation_id, notificationGroupData, next) {
  // Create organisation.
  notificationGroup = new NotificationGroup({
    'name': notificationGroupData.name,
    'description': notificationGroupData.description,
    'organisation': organisation_id,
    'accounts': [],
  });

  // if image exists, upload image to DB, then link it to organisation if it was created successfully.
  if (notificationGroupData.imagePath) {
    imageController.saveImage(notificationGroupData.imagePath, notificationGroupData.contentType, organisation_id, function(err, image){
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

/*
Return the notification group from the organisation and notification group tokens.
This will be called after a send-notificaiton post request.
*/
notificationGroupController.getNotificationGroupFromIssuerTokens = function(organisationToken, notificationGroupToken, next) {
  NotificationGroup.findOne({
    'token': notificationGroupToken,
  }, function(err, notificationGroup) {
    if (err) { return next(err,null); }
    else if (notificationGroup.organisation.token === organisationToken) { return next(null, notificationGroup); }
    else { return next(null,null); }
  }).populate('accounts');
};

module.exports = notificationGroupController;
