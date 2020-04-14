var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var Account = require('../../models/Account');
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
        //check account table for anyone with a google ID of profile.id
        Account.findOne({
            'google.id': profile.id
        }, function(err, account) {
            if (err) {
                return done(err);
            }
            if (account) {
              //found account. Return
              return done(err, account._id);
            }
            if (!account) {
              // No account was found, if email already exists, add this google_id to the account.
              Account.findOne({
                  'email': profile.emails[0].value
              }, function(err, account) {
                  if (err) {
                      return done(err);
                  }
                  if (account) {
                    account.google = {
                      id: profile.id,
                      displayName: profile.displayName
                    }
                    account.save(function(err) {
                      if (err) {
                        return done(err)
                      } else {
                        //found account. Return
                        return done(err, account._id);
                      }
                    });
                  } else {
                    // No email was found... so create a new account with values from Google (all the profile. stuff)
                    account = new Account({
                      name: profile.displayName,
                      email: profile.emails[0].value,
                      //now in the future searching on Account.findOne({'google.id': profile.id } will match because of this next line
                      google: {
                        id: profile.id,
                        displayName: profile.displayName
                      },
                      provider: 'google'
                    });
                    account.save(function(err) {
                      if (err) console.log(err);
                      return done(err, account._id);
                    });
                  }
                });
              }
            }
          )
        }
      ));

module.exports = passport;
