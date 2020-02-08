var express = require('express');
var router = express.Router();
var mv = require('mv');
var fs = require('fs');
var formidable = require("formidable");
var authController = require("../../controllers/AuthController.js");
var organisationController = require("../../controllers/developer/OrganisationController.js");

function auth_organisation(res, user_id, organisation_id, next) {
  organisationController.getOrganisationFromId(user_id, organisation_id, function(err, organisation) {
    if (err) {
      res.redirect('/developer');
    } else if (!organisation) {
      console.log('Not part of this organisation');
      res.redirect('/developer');
    }

    // Else, perform next operation.
    else { next(organisation); }
  });
}

/*
Organisation dashboard.
Parameter for organisation._id.
If there are any errors, print to screen and redirect to developer page.
*/
router.get('/:organisation', authController.checkAuthentication, (req,res) => {
  auth_organisation(res, req.session.passport.user._id, req.params.organisation, function(organisation) {
    // if user is authorised to control the organisation:
    res.render('developer/organisation/dashboard', {req: req, organisation: organisation});
  });
});

/*
Display page to create new notification group for this organisation.
*/
router.get('/:organisation/new-notification-group', authController.checkAuthentication, (req,res) => {
  auth_organisation(res, req.session.passport.user._id, req.params.organisation, function(organisation) {
    // if user is authorised to control the organisation:
    res.render('developer/organisation/newNotificationGroup', {req: req, organisation: organisation});
  });
});

/*
Handle the creation of a new notification group to this organisation.
*/
router.post('/:organisation/new-notification-group/submit', authController.checkAuthentication, (req,res) => {
  auth_organisation(res, req.session.passport.user._id, req.params.organisation, function(organisation) {
    // if user is authorised to control the organisation:

    var form = new formidable.IncomingForm()
    form.uploadDir = "temp";
    form.parse(req, function(err, fields, files) {
      if (err) { res.send(err); }

      // validation check on inputs.
      if (!fields.name) { // check if name exists.
        res.send('Server error 308: cannot find name');
      } else if (!fields.description) { // check if description exists.
        res.send('Server error 308: cannot find description');
      } else if (files.file.size > 0 && files.file.type.split('/')[0] !== 'image') {  // check if file type is not image
        res.send('Server error 308: file must be an image');
      } else {  // if all validation checks have been passed.

        // if image exists, rename file.
        if (files.file.size > 0) {
          var newPath = 'temp/'+files.file.name;
          mv(files.file.path, newPath, function(err){
            if (err) {
              console.log(err);
              res.send('Server error 308: internal error.');
            } else {
              var notificationGroupData = {
                'name': fields.name,
                'description': fields.description,
                'imagePath': newPath,
              };
              innerCreateNotificationGroup(notificationGroupData);
            }
          });
        } else {
          var notificationGroupData = {
            'name': fields.name,
            'description': fields.description,
          };
          innerCreateNotificationGroup(notificationGroupData);
        }

        // common function, regardless if image was uploaded.
        function innerCreateNotificationGroup(notificationGroupData) {
          organisationController.createNotificationGroup(req.params.organisation, notificationGroupData, function(err, notificationGroup) {

            // delete temp file if image was uploaded.
            if (files.file.size > 0) {
              fs.unlink(newPath, function(err){});
            } else {
              fs.unlink(files.file.path, function(err){});
            }

            res.render('developer/organisation/newNotificationGroup', {req: req, organisation: organisation});
          });
        }
      }
    });
  });
});

module.exports = router;
