const GoogleStrategy = require("passport-google-oauth2").Strategy;
const passport = require("passport");
const keys = require("../config/keys");

const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.clientID,
      clientSecret: keys.clientSecret,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      await User.findOne({ googleId: profile.id }).then(async (err, user) => {
        if (err) {
          return done(err);
        }
        if (user) {
          user.accessToken.push(accessToken);
          await user.save();
          return done(err, user);
        } else if (!user) {
          console.log(profile);
          const x = {
            email: profile.emails[0].value,
            displayPicture: profile.photos[0].value,
            name: profile._json.name,
            googleId: profile.id,
          };
          await User.create(x, async (err, newUser) => {
            console.log(newUser);
            newUser.accessToken.push(accessToken);
            await newUser.save();
            return done(err, newUser);
          });
        }
      });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});