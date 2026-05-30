import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";

// Configure Passport to use the Google OAuth 2.0 Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    // This callback is executed after Google successfully authenticates the user.
    // 'profile' contains the user's public Google account information.
    // TODO: In a production app, query/save the user in your database here:
    // User.findOne({ googleId: profile.id }).then(user => { ... return done(null, user); })
    return done(null, profile);
}));

// Serialize User: Determines which data from the user object should be stored in the session.
// Here we are storing the entire user profile in the session.
// In production, you'd typically store just the database user ID (e.g., done(null, user.id)).
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize User: Retrieves the full user object from the session data on subsequent requests.
// Passport attaches the retrieved object to the request as 'req.user'.
passport.deserializeUser((user, done) => {
    done(null, user);
});