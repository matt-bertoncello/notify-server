var express = require('express');
var router = express.Router();
var authController = require("../controllers/AuthController.js");

/* Dashboard */
router.get('/', authController.checkAuthentication, (req,res) => {
  res.render('developer/dashboard', {req: req});
});

module.exports = router;
