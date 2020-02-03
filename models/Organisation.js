var mongoose = require('mongoose');
var User = require('./User');

var OrganisationSchema = new mongoose.Schema({
  name: {type:String, required:true},
  image: {type:mongoose.Schema.Types.ObjectId, ref:'Image'},
  admin: [ {type:mongoose.Schema.Types.ObjectId, required:true, ref:User} ],
  developers: [ {type:mongoose.Schema.Types.ObjectId, required:true, ref:User} ],
  email: {type:String, required:true},
  mainColour: {type:String, required:true},
  secondaryColour: {type:String, required:true},
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
});

// On pre-save, update the 'updated' field and check if password needs to be re-hashed.
OrganisationSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

/*
Return 'admin' if user is admin.
Return 'developer' if user is developer.
Return null if neither admin nor developer.
*/
OrganisationSchema.methods.getUserRole = function(user_id) {
  if (this.admin.includes(user_id)){
    return 'admin';
  } else if (this.developers.includes(user_id)){
    return 'developer';
  } else {
    return null;
  }
};

module.exports = mongoose.model('Organisation', OrganisationSchema);
