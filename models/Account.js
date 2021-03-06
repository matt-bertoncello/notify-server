var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var passportLocalMongoose = require('passport-local-mongoose');
var SALT_WORK_FACTOR = 10;

var AccountSchema = new mongoose.Schema({
  name: String,
  google: {
    id: String,
    displayName: String,
  },
  facebook: {
    id: String,
    displayName: String,
  },
  twitter: {
    id: String,
    accountname: String,
    displayName: String,
  },
  github: {
    id: String,
    accountname: String,
    displayName: String,
  },
  email: {type:String, unique:true, required:true},
  provider: String,
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
  password: String,
});

// On pre-save, update the 'updated' field and check if password needs to be re-hashed.
AccountSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

/*
Comparare the raw text password to the saved hash password.
Return isMatch = True is passwords match.
*/
AccountSchema.methods.comparePassword = function(candidatePassword, next) {
  // If there is no password saved:
  if (!this.password) {
    return next('[ERROR] no password saved for this account', false);
  }

  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if (err) return next(err, false);
      if (!isMatch) return next("[ERROR] this password and email combination is incorrect", false);
      return next(null, isMatch);
  });
};

/*
Updates the saved account password. Will take raw password as input and save hash.
Assume AccountController has performed strength checks on newPassword.
*/
AccountSchema.methods.updatePassword = function(newPassword, next) {
  account = this;

  if (!newPassword) {
    err = "[ERROR] no password provided.";
    return next(err, false);
  }

  // salt and save password.
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) { // generate a salt
    if (err) return next(err, false);

    // hash the password along with our new salt
    bcrypt.hash(newPassword, salt, function(err, hash) {
        if (err) return next(err, false);
        account.password = hash; // saved the hashed password

        account.save(function(err) {
          if (err) {return next(err, false);}
          else {return next(null, true);}
        });
    });
  });
}

/*
Add this firebase token to list of account's tokens.
Each token refers to a unique mobile device.
When Notify is triggered to send to this account, all tokens will be sent.
*/
AccountSchema.methods.addFirebaseToken = function(token, next) {
  // if token is not already saved in array, push to array.
  if (!this.notify.firebaseInstances.includes(token)) {
    this.notify.firebaseInstances.push(token);

    this.save(function(err) {
      if (err) {return next(err, false);}
      else {
        console.log("added firebase instance: "+token);
        return next(null, true);
      }
    });
  } else {
    return next(null, true);
  }
}

/*
Remove this firebaseInstance from the account.
*/
AccountSchema.methods.removeFirebaseInstance = function(firebaseInstance, next) {
  console.log('remove: '+firebaseInstance);
  this.notify.firebaseInstances = this.notify.firebaseInstances.filter(function(value, index, arr){
    return value != firebaseInstance;
  });

  // save
  this.save(function(err) {
    if (err) {return next(err, false);}
    else {return next(null, true);}
  });
}

module.exports = mongoose.model('Account', AccountSchema);
