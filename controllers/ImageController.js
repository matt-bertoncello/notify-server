var fs = require("fs");
var path = require("path");
var Image = require("../models/Image");

var imageController = {};

/*
Create new Image document in DB if the file can be loaded successfully.
*/
imageController.saveImage = function(localPath, user_id, next) {
  var name = localPath.replace(/^.*[\\\/]/, ''); // get filename from path. Include the extension.

  // Load file and then save in DB.
  fs.readFile(localPath, function(err, bufferData) {
    // If there is an error loading the data, throw an error.
    if (err) { return next(err, null); }

    // else, save to a new Image document in mongoose.
    else {
      // save image in mongoose that can be indexed by 'path'.
      function innerSaveImage(name) {
        image = new Image({
          'name': name,
          'data': bufferData,
          'uploader': user_id,
          'path': name,
          'contentType': localPath.substring(localPath.lastIndexOf('.')+1, localPath.length) || localPath,
        });

        image.save(function(err) {
          // if duplicate path, save at newpath.
          if (err && err.code === 11000) {
            return innerSaveImage('0'+name);
          }
          else if (err) { return next(err, null); }
          else { return next(err, image); }
        });
      }

      return innerSaveImage(name);
    };
  });
};

/*
Return the organisation with the organisation_id if this user is an admin or a developer.
*/
imageController.getImageFromPath = function(path, next) {
  Image.findOne({
    'path': encodeURI(path),
  }, function(err, image) {
    next(err, image);
  });
};

// imageController.saveImage("C:\\Users\\mattb\\Pictures\\Photoshop\\Notify\\old\\Notify-48px-round.png", "5e23914cc6458b320049c48f", function(err, image){
//   console.log(err);
//   console.log(image);
// });

module.exports = imageController;
