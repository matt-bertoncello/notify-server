var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var NotificationGroupSchema = new mongoose.Schema({
  name: {type:String, required:true},
  description: {type:String, required:true},
  organisation: {type:mongoose.Schema.Types.ObjectId, required:true, ref:'Organisation'},
  users: [{type:mongoose.Schema.Types.ObjectId, required:true, ref:'User'}],
  image: {type:String, ref:'Image'},
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
});

/*
On pre-save, update the 'updated' field and check if password needs to be re-hashed.
Needs to have organisation populated.
*/
NotificationGroupSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

// After initialised by a find. populate the organisation and imagePath attributes.
NotificationGroupSchema.post('init', function(doc) {
  // if this notification group has an image, populate image and return the image.
  if (doc.image) {
    doc.displayImage = doc.image;
  }

  // else, populate the organisation and their
  else if (doc.organisation.image) {
    doc.displayImage = doc.organisation.image;
  }

  else {
    doc.displayImage = null;
  }

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

module.exports = mongoose.model('NotificationGroup', NotificationGroupSchema);
