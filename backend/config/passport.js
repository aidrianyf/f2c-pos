const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { USER_STATUS } = require('./constants');

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy - only enable if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists - check if they're approved
          if (user.status === USER_STATUS.PENDING) {
            return done(null, false, { message: 'Your account is pending approval by an administrator.' });
          }

          if (user.status === USER_STATUS.INACTIVE) {
            return done(null, false, { message: 'Your account has been deactivated. Please contact an administrator.' });
          }

          // Update last login
          user.lastLogin = Date.now();
          await user.save();

          return done(null, user);
        }

        // Check if email already exists (maybe with local auth)
        const existingEmailUser = await User.findOne({ email: profile.emails[0].value });

        if (existingEmailUser) {
          // Email exists with local auth - link accounts
          existingEmailUser.googleId = profile.id;
          existingEmailUser.authProvider = 'google';
          existingEmailUser.avatar = {
            url: profile.photos[0]?.value
          };
          existingEmailUser.lastLogin = Date.now();
          await existingEmailUser.save();

          return done(null, existingEmailUser);
        }

        // Create new user with pending status
        const nameParts = profile.displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || nameParts[0];

        const newUser = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          firstName: firstName,
          lastName: lastName,
          authProvider: 'google',
          avatar: {
            url: profile.photos[0]?.value
          },
          status: USER_STATUS.PENDING, // Require admin approval
          lastLogin: Date.now()
        });

        // Return user with pending status message
        return done(null, false, {
          message: 'Account created successfully! Please wait for administrator approval.',
          userId: newUser._id
        });

      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
  );
  console.log('✅ Google OAuth strategy enabled');
} else {
  console.log('⚠️  Google OAuth disabled - missing credentials');
}

module.exports = passport;
