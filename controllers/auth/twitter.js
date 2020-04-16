var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;
var Account = require('../../models/Account');
require('dotenv').config();

passport.serializeUser(function (account, fn) {
  fn(null, account);
});

passport.deserializeUser(function (id, fn) {
  Account.findOne({twitter_id: id.doc}, function (err, account) {
    fn(err, account);
  });
});

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CLIENT_ID,
    consumerSecret: process.env.TWITTER_CLIENT_SECRET,
    callbackURL: "/auth/twitter/callback",
    includeEmail: true,
    passReqToCallback: true,
    proxy: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    Account.findOne({
        'twitter.id': profile.id
    }, function(err, account) {
        if (err) {
            return done(err);
        }
        if (account) {
          //found account. Return
          return done(err, account._id);
        }
        if (!account) {
          // No account was found, if email already exists, add this twitter_id to the account.
          Account.findOne({
              'email': profile.emails[0].value
          }, function(err, account) {
              if (err) {
                  return done(err);
              }
              if (account) {
                account.twitter = {
                  id: profile.id,
                  accountname: profile.accountname,
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
                // No email was found... so create a new account with values from twitter (all the profile. stuff)
                account = new Account({
                  name: profile.displayName,
                  email: profile.emails[0].value,
                  //now in the future searching on Account.findOne({'twitter.id': profile.id } will match because of this next line
                  twitter: {
                    id: profile.id,
                    accountname: profile.accountname,
                    displayName: profile.displayName
                  },
                  provider: 'twitter'
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
));

module.exports = passport;
