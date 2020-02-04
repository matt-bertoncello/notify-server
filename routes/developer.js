var express = require('express');
var router = express.Router();
var formidable = require("formidable");
var fs = require("fs");
var mv = require("mv");
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
router.get('/new-organisation', authController.checkAuthentication, (req,res) => {
  res.render('developer/newOrganisation', {req: req});
});

/* POST response for creating new organisation */
router.post('/new-organisation/submit', authController.checkAuthentication, (req,res) => {
  // save file to '/temp' directory before creating Image document in DB.
  var form = new formidable.IncomingForm()
  form.uploadDir = "temp";
  form.parse(req, function(err, fields, files) {
    if (err) { res.send(err); }

    // validation check on inputs.
    if (!/^#[0-9A-F]{6}$/i.test(fields.mainColour)) { // check if mainColour is invalid.
      res.send('Server error 305');
    } else if (!/^#[0-9A-F]{6}$/i.test(fields.secondaryColour)) { // check if secondaryColour is invalid.
      res.send('Server error 306');
    } else if (files.file.type.split('/')[0] !== 'image') {  // check if file type is not image
      res.send('Server error 307');
    } else {  // if all validation checks have been passed.

      var newPath = 'temp/'+files.file.name;
      mv(files.file.path, newPath, function(err){
        if (err) {
          console.log(err);
          res.send('Server error 303');
        } else {
          // when file is uploaded, create new organisation with this file.
          organisationController.createOrganisation(newPath,
            req.session.passport.user,
            fields.name,
            fields.mainColour,
            fields.secondaryColour,
            function(err, organisation) {

            // delete temp file.
            fs.unlink(newPath, function(err){});

            if (err) {
              console.log(err);
              res.send('Server error 304');
            } else {
              res.redirect('/organisation/'+organisation._id);
            }
          });
        }
      });
    };
  });
});

module.exports = router;
