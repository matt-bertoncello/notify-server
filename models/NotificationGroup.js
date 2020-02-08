var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var NotificationGroupSchema = new mongoose.Schema({
  name: {type:String, required:true},
  description: {type:String, required:true},
  organisation: {type:mongoose.Schema.Types.ObjectId, required:true, ref:'Organisation'},
  users: [{type:mongoose.Schema.Types.ObjectId, required:true, ref:'User'}],
  image: {type:mongoose.Schema.Types.ObjectId, ref:'Image'},
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
});

// On pre-save, update the 'updated' field and check if password needs to be re-hashed.
NotificationGroupSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

/*
Add user to notification group then run next(err);
*/
NotificationGroupSchema.methods.addUser = function(user_id, next) {
  if (this.users.includes(user_id)) {
    continue;
  } else {
    this.users.push(user_id);
  }

  this.save(function(err){
    return next(err);
  });
};

/*
Remove user to notification group then run next(err);
*/
NotificationGroupSchema.methods.addUser = function(user_id, next) {
  if (this.users.includes(user_id)) {
    this.users.splice(this.users.indexOf(user_id), 1);

    this.save(function(err){
      return next(err);
    });
  } else {
    return next(null);
  }
};

/*
Rename notification group then run next(err);
*/
NotificationGroupSchema.methods.rename = function(name, next) {
  this.name = name;

  this.save(function(err){
    return next(err);
  });
};

/*
Remove image from this notification group. next(err).
*/
NotificationGroupSchema.methods.rename = function(name, next) {
  delete this.image;

  this.save(function(err){
    return next(err);
  });
};

/*
Get image. If no image is defined return the organisation's image.
Return next(err, image);
*/
NotificationGroupSchema.methods.getImage = function(next) {
  // if this notification group has an image, populate image and return the image.
  if (this.image) {
    this.populate('image', function(err){
      if (err) {return next(err, null);}
      else {next(null, this.image);}
    });
  }

  // else, populate the organisation and their
  else {
    return this.populate('organisation', 'image', function(err){
      if (err) {return next(err, null);}
      else {
        this.organisation.populate('image', function(err){
          if (err) {return next(err, null);}
          else {next(null, this.image);}
        });
      };
    });
  };
};

module.exports = mongoose.model('NotificationGroup', NotificationGroupSchema);
