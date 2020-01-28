var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
  name: String,
  users: [{type:mongoose.Schema.Types.ObjectId, required:true, ref:User}],
  email: {type:String, unique:true, required:true},
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
});

// On pre-save, update the 'updated' field and check if password needs to be re-hashed.
UserSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});
