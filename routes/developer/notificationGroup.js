var express = require('express');
var router = express.Router();
var imageController = require("../../controllers/developer/ImageController.js");
var notificationGroupController = require("../../controllers/developer/NotificationGroupController.js");

/* Retrieved image indexed by 'image' */
router.get('/:notificationGroup', (req,res) => {
  notificationGroupController.getNotificationGroupById(req.session.passport.user._id, req.params.notificationGroup, function(err, notificationGroup) {
    res.render('developer/notificationGroup/dashboard', {req: req, notificationGroup: notificationGroup});
  });
});

module.exports = router;
