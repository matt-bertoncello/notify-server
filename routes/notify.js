var express = require('express');
var router = express.Router();

/* Dashboard */
router.get('/', (req,res) => {
  res.render('send', {req: req});
});

module.exports = router;
