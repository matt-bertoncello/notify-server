var express = require('express');
var router = express.Router();
var formidable = require("formidable");
var fs = require("fs");
var authController = require("../controllers/AuthController.js");
var organisationController = require("../controllers/OrganisationController.js");

/* Dashboard */
router.get('/', authController.checkAuthentication, (req,res) => {
  // get all organisations that this user is a developer or an admin.
  organisationController.getAllOrganisationsForUser(req.session.passport.user._id, function(err, organisations) {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      res.render('developer/dashboard', {req: req, organisations: organisations});
    }
  });
});

/* Create new organisation page */
router.get('/new', authController.checkAuthentication, (req,res) => {
  res.render('developer/newOrganisation', {req: req});
});

/* POST response for creating new organisation */
router.post('/new/organisation', authController.checkAuthentication, (req,res) => {
  // save file to '/temp' directory before creating Image document in DB.
  new formidable.IncomingForm().parse(req, function(err, fields, files) {
    if (err) { res.send(err); }

    // move file onto server.
    var oldpath = files.file.path;
    var newpath = 'temp/' + files.file.name;
    fs.rename(oldpath, newpath, function (err) {
      if (err) { console.log(err); }
      else {
        // when file is uploaded, create new organisation with this file.
        organisationController.createOrganisation(newpath,
          req.session.passport.user,
          fields.name,
          fields.mainColour,
          fields.secondaryColour,
          function(err, organisation) {
          // delete temp file.
          fs.unlink(newpath, function(err){});

          if (err) {
            res.send('Server error 304');
          } else {
            res.redirect('/organisation/'+organisation._id);
          }
        });
      }
    });
  });
});

module.exports = router;
