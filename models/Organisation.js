var mongoose = require('mongoose');
var User = require('./User');
var Image = require('./Image');

var OrganisationSchema = new mongoose.Schema({
  name: {type:String, required:true},
  image: {type:mongoose.Schema.Types.ObjectId, required:true, ref:Image},
  admin: [ {type:mongoose.Schema.Types.ObjectId, required:true, ref:User} ],
  developers: [ {type:mongoose.Schema.Types.ObjectId, required:true, ref:User} ],
  email: {type:String, required:true},
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
});

// On pre-save, update the 'updated' field and check if password needs to be re-hashed.
OrganisationSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

module.exports = mongoose.model('Organisation', OrganisationSchema);
