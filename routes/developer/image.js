var express = require('express');
var router = express.Router();
var imageController = require("../../controllers/developer/ImageController.js");

/* Retrieved image indexed by 'image' */
router.get('/:image', (req,res) => {
  imageController.getImageFromPath(req.params.image, function(err, image) {
    if (err) {
      res.send('Server error 303');
    }
    else if (!image) {
      res.send('No image found with path: '+encodeURI(req.params.image));
    }
    else {
      res.setHeader('content-type', image.contentType); // tell browser this is an image.
      res.set('Cache-Control', 'public, max-age=31557600'); // set max-age so browser won't check for an updated file.
      res.send(image.data);
    }
  });
});

module.exports = router;
