var fs = require("fs");
var shortid = require("shortid");
var Image = require("../../models/Image");

var imageController = {};

/*
Create new Image document in DB if the file can be loaded successfully.
*/
imageController.saveImage = function(localPath, contentType, organisation_id, next) {
  var name = localPath.replace(/^.*[\\\/]/, ''); // get filename from path. Include the extension.

  // Load file and then save in DB.
  fs.readFile(localPath, function(err, bufferData) {
    // If there is an error loading the data, throw an error.
    if (err) { return next(err, null); }

    // else, save to a new Image document in mongoose.
    else {
      // save image in mongoose that can be indexed by 'path'.
      function innerSaveImage(uniqueName) {
        image = new Image({
          '_id': encodeURI(uniqueName),
          'name': name,
          'data': bufferData,
          'organisation': organisation_id,
          'contentType': contentType,
        });

        image.save(function(err) {
          // if duplicate path, save at newpath.
          if (err && err.code === 11000) {
            return innerSaveImage(shortid.generate()+name);
          }
          else if (err) { return next(err, null); }
          else { return next(err, image); }
        });
      }

      return innerSaveImage(shortid.generate()+name);
    };
  });
};

/*
Return the organisation with the organisation_id if this account is an admin or a developer.
*/
imageController.getImageFromPath = function(path, next) {
  Image.findOne({
    '_id': encodeURI(path),
  }, function(err, image) {
    next(err, image);
  });
};

module.exports = imageController;
