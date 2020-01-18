var passport = require('passport')
  , GitHubStrategy = require('passport-github').Strategy;
var User = require('../../models/User');
require('dotenv').config();

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/auth/github/callback",
    passReqToCallback: true,
    scope: ['user:email'],
    proxy: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    //check user table for anyone with a github ID of profile.id
    User.findOne({
        'github.id': profile.id
    }, function(err, user) {
        if (err) {
            return done(err);
        }
        if (user) {
          return done(err, user._id);
        }
        if (!user) {
          // No user was found, if email already exists, add this github_id to the account.
          User.findOne({
              'email': profile.emails[0].value
          }, function(err, user) {
              if (err) {
                  return done(err);
              }
              if (user) {
                user.github = {
                  id: profile.id,
                  username: profile.username,
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
                // No email was found... so create a new user with values from github (all the profile. stuff)
                user = new User({
                  name: profile.displayName,
                  email: profile.emails[0].value,
                  username: profile.username,
                  //now in the future searching on User.findOne({'github.id': profile.id } will match because of this next line
                  github: {
                    id: profile.id,
                    username: profile.username,
                    displayName: profile.displayName
                  },
                  provider: 'github'
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
