var mongoose = require('mongoose');
var Account = require('./Account');
var uuid = require('uuid/v4');

var OrganisationSchema = new mongoose.Schema({
  name: {type:String, required:true},
  image: {type:String, ref:'Image'},
  admin: [ {type:mongoose.Schema.Types.ObjectId, required:true, ref:Account} ],
  developers: [ {type:mongoose.Schema.Types.ObjectId, required:true, ref:Account} ],
  email: {type:String, required:true},
  mainColour: {type:String, required:true},
  secondaryColour: {type:String, required:true},
  token: {type: String, unique:true, default: uuid},
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
});

// On pre-save, update the 'updated' field and check if password needs to be re-hashed.
OrganisationSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

/*
Return 'admin' if account is admin.
Return 'developer' if account is developer.
Return null if neither admin nor developer.
*/
OrganisationSchema.methods.getAccountRole = function(account_id) {
  if (this.admin.includes(account_id)){
    return 'admin';
  } else if (this.developers.includes(account_id)){
    return 'developer';
  } else {
    return null;
  }
};

module.exports = mongoose.model('Organisation', OrganisationSchema);
