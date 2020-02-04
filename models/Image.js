var mongoose = require('mongoose');
var User = require('./User');

var ImageSchema = new mongoose.Schema({
  name: {type:String, required:true},
  data: {type:Buffer, required:true},  // hold image data here. Cannot required:true for some reason.
  organisation: {type:mongoose.Schema.Types.ObjectId, required:true, ref:'Organisation'},
  path: {type:String, required:true, unique:true},
  contentType: {type:String, required:true},
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
});

// On pre-save, update the 'updated' field and check if password needs to be re-hashed.
ImageSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

module.exports = mongoose.model('Image', ImageSchema);
