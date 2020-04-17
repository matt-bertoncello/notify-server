var express = require('express');
var router = express.Router();
var accountController = require("../controllers/AccountController.js");

router.get('/terms-of-service', accountController.updateAccount, function(req,res) {
  res.render('legal/terms-of-service', {req: req});
});

router.get('/privacy-policy', accountController.updateAccount, function(req,res) {
  res.render('legal/privacy-policy', {req: req});
});

module.exports = router;
