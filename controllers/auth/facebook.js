var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../../models/User');
require('dotenv').config();

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "/auth/facebook/callback",
    passReqToCallback : true,
    profileFields: ['id', 'emails'],
    proxy: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    User.findOne({
        'facbook.id': profile.id
    }, function(err, user) {
        if (err) {
            return done(err);
        }
        if (user) {
          //found user. Return
          user.facebook.displayName = profile.displayName;
          user.save(function(err) {
            if (err) console.log(err);
            return done(err, user._id);
          });
        }
        if (!user) {
          // No user was found, if email already exists, add this facebook_id to the account.
          User.findOne({
              'email': profile.emails[0].value
          }, function(err, user) {
              if (err) {
                  return done(err);
              }
              if (user) {
                user.facebook = {
                  id: profile.id,
                  displayName: profile.displayName
                }
                user.save(function(err) {
                  if (err) console.log(err);
                  return done(err, user._id);
                });
              } else {
                // No email was found... so create a new user with values from facebook (all the profile. stuff)
                user = new User({
                  name: profile.displayName,
                  email: profile.emails[0].value,
                  //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
                  facbook: {
                    id: profile.id,
                    displayName: profile.displayName
                  },
                  provider: 'facebook'
                });
                user.save(function(err) {
                  if (err) console.log(err);
                  return done(err, user._id);
                });
              }
            });
          }
        })
      }
  )
);

module.exports = passport;
