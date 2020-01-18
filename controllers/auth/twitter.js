var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;
var User = require('../../models/User');
require('dotenv').config();

passport.serializeUser(function (user, fn) {
  fn(null, user);
});

passport.deserializeUser(function (id, fn) {
  User.findOne({twitter_id: id.doc}, function (err, user) {
    fn(err, user);
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
    User.findOne({
        'twitter.id': profile.id
    }, function(err, user) {
        if (err) {
            return done(err);
        }
        if (user) {
          //found user. Return
          return done(err, user._id);
        }
        if (!user) {
          // No user was found, if email already exists, add this twitter_id to the account.
          User.findOne({
              'email': profile.emails[0].value
          }, function(err, user) {
              if (err) {
                  return done(err);
              }
              if (user) {
                user.twitter = {
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
                // No email was found... so create a new user with values from twitter (all the profile. stuff)
                user = new User({
                  name: profile.displayName,
                  email: profile.emails[0].value,
                  username: profile.username,
                  //now in the future searching on User.findOne({'twitter.id': profile.id } will match because of this next line
                  twitter: {
                    id: profile.id,
                    username: profile.username,
                    displayName: profile.displayName
                  },
                  provider: 'twitter'
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
));

module.exports = passport;
