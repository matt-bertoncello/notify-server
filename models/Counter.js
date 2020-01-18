var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var counter = new mongoose.Schema({
  _id: {type:String},
  count: {type:Number, default:0},
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now}
}, { _id: false });

counter.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

module.exports = mongoose.model('Counter', counter);
