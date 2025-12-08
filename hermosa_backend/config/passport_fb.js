const passport = require("passport");
const User = ("../models/user.js");
const { Strategy: FacebookStrategy } = require("passport-facebook");
const dotenv = require("dotenv");

dotenv.config(); 

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "displayName"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ facebookID: profile.id });
        if (!user) {
          user = await User.create({
            facebookID: profile.id,
            name: profile.displayName,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
