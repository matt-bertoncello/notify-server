var express = require('express');
var router = express.Router();
var authController = require("../controllers/AuthController.js");
var organisationController = require("../controllers/OrganisationController.js");

/*
Organisation dashboard.
Parameter for organisation._id.
If there are any errors, print to screen and redirect to developer page.
*/
router.get('/:organisation', authController.checkAuthentication, (req,res) => {
  organisationController.getOrganisationFromId(req.session.passport.user._id, req.params.organisation, function(err, organisaiton) {
    if (err) {
      console.log(err);
      res.redirect('/developer');
    }
    else if (!organisation) {
      console.log('Server error 303');
      res.redirect('/developer');
    }
    // Else, load page with details about this organisation.
    else {res.render('organisation/dashboard', {req: req, organisation: organisation});}
  });
});

module.exports = router;
