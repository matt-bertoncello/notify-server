var express = require('express');
var router = express.Router();
var authController = require("../controllers/AuthController.js");
var organisationController = require("../controllers/OrganisationController.js");

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
    res.render('organisation/dashboard', {req: req, organisation: organisation});
  });
});

/*
Display page to create new notification group for this organisation.
*/
router.get('/:organisation/new-notification-group', authController.checkAuthentication, (req,res) => {
  auth_organisation(res, req.session.passport.user._id, req.params.organisation, function(organisation) {
    // if user is authorised to control the organisation:
    res.render('organisation/newNotificationGroup', {req: req, organisation: organisation});
  });
});

/*
Handle the creation of a new notification group to this organisation.
*/
router.get('/:organisation/new-notification-group/submit', authController.checkAuthentication, (req,res) => {
  auth_organisation(res, req.session.passport.user._id, req.params.organisation, function(organisation) {
    // if user is authorised to control the organisation:

    var form = new formidable.IncomingForm()
    form.uploadDir = "temp";
    form.parse(req, function(err, fields, files) {
      if (err) { res.send(err); }
      else {
        console.log(fields);
        console.log(files);
      }
    });
  });
});

module.exports = router;
