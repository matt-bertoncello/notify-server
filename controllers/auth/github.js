var passport = require('passport')
  , GitHubStrategy = require('passport-github').Strategy;
var Account = require('../../models/Account');
require('dotenv').config();

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/auth/github/callback",
    passReqToCallback: true,
    scope: ['account:email'],
    proxy: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    //check account table for anyone with a github ID of profile.id
    Account.findOne({
        'github.id': profile.id
    }, function(err, account) {
        if (err) {
            return done(err);
        }
        if (account) {
          return done(err, account._id);
        }
        if (!account) {
          // No account was found, if email already exists, add this github_id to the account.
          Account.findOne({
              'email': profile.emails[0].value
          }, function(err, account) {
              if (err) {
                  return done(err);
              }
              if (account) {
                account.github = {
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
                // No email was found... so create a new account with values from github (all the profile. stuff)
                account = new Account({
                  name: profile.displayName,
                  email: profile.emails[0].value,
                  //now in the future searching on Account.findOne({'github.id': profile.id } will match because of this next line
                  github: {
                    id: profile.id,
                    accountname: profile.accountname,
                    displayName: profile.displayName
                  },
                  provider: 'github'
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
