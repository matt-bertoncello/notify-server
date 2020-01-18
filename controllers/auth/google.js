var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../../models/User');
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
        //check user table for anyone with a google ID of profile.id
        User.findOne({
            'google.id': profile.id
        }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (user) {
              //found user. Return
              return done(err, user._id);
            }
            if (!user) {
              // No user was found, if email already exists, add this google_id to the account.
              User.findOne({
                  'email': profile.emails[0].value
              }, function(err, user) {
                  if (err) {
                      return done(err);
                  }
                  if (user) {
                    user.google = {
                      id: profile.id,
                      displayName: profile.displayName
                    }
                    user.save(function(err) {
                      if (err) {
                        return done(err)
                      } else {
                        //found user. Return
                        return done(err, user._id);
                      }
                    });
                  } else {
                    // No email was found... so create a new user with values from Google (all the profile. stuff)
                    user = new User({
                      name: profile.displayName,
                      email: profile.emails[0].value,
                      //now in the future searching on User.findOne({'google.id': profile.id } will match because of this next line
                      google: {
                        id: profile.id,
                        displayName: profile.displayName
                      },
                      provider: 'google'
                    });
                    user.save(function(err) {
                      if (err) console.log(err);
                      return done(err, user._id);
                    });
                  }
                });
              }
            }
          )
        }
      ));

module.exports = passport;
