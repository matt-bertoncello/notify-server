var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;
var Account = require('../../models/Account');
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
    Account.findOne({
        'facbook.id': profile.id
    }, function(err, account) {
        if (err) {
            return done(err);
        }
        if (account) {
          //found account. Return
          account.facebook.displayName = profile.displayName;
          account.save(function(err) {
            if (err) console.log(err);
            return done(err, account._id);
          });
        }
        if (!account) {
          // No account was found, if email already exists, add this facebook_id to the account.
          Account.findOne({
              'email': profile.emails[0].value
          }, function(err, account) {
              if (err) {
                  return done(err);
              }
              if (account) {
                account.facebook = {
                  id: profile.id,
                  displayName: profile.displayName
                }
                account.save(function(err) {
                  if (err) console.log(err);
                  return done(err, account._id);
                });
              } else {
                // No email was found... so create a new account with values from facebook (all the profile. stuff)
                account = new Account({
                  name: profile.displayName,
                  email: profile.emails[0].value,
                  //now in the future searching on Account.findOne({'facebook.id': profile.id } will match because of this next line
                  facbook: {
                    id: profile.id,
                    displayName: profile.displayName
                  },
                  provider: 'facebook'
                });
                account.save(function(err) {
                  if (err) console.log(err);
                  return done(err, account._id);
                });
              }
            });
          }
        })
      }
  )
);

module.exports = passport;
