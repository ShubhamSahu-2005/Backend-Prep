import express from "express";
import { todoRoutes } from "./modules/todo/todo.routes.js";
import dotenv from "dotenv";
dotenv.config();
import session from "express-session";
import passport from "passport";
import('./config/passport.js');

const app = express();
// 1. Session Middleware: Creates and signs a session cookie for client requests to persist authentication state.
app.use(session(
    {
        secret: process.env.SESSION_SECRET,
        resave: false, 
        saveUninitialized: false,
    }
))

// 2. Initialize Passport: Sets up Passport's internal state and hooks it into Express.
app.use(passport.initialize());

// 3. Connect Passport to Sessions: Deserializes the session cookie and attaches the authenticated user object to 'req.user'.
app.use(passport.session());



const PORT = process.env.PORT || 3000;
app.use(express.json());

// Root Route: Checks if user is logged in (req.isAuthenticated() returns true) and greets them.
app.get("/", (req, res) => {
    if(req.isAuthenticated()){
    res.send(`Hello,${req.user.displayName}!<a href="/logout">Logout</a>`);

}else {
    res.send('<a href="/auth/google">Login with Google</a>');


}
});

// OAuth Flow Step 1: Redirects user to Google for authentication, requesting public profile and email permissions.
app.get("/auth/google",
    passport.authenticate("google", { scope: ['profile', 'email'] })
);

// OAuth Flow Step 2: Google redirects the user back here with an authorization code.
// Passport exchanges the code for user profile details. On success, redirects to root ("/").
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: "/" }),
    (req, res) => {
        res.redirect('/');
    }
);

// Logout Route: Clears the authenticated session and redirects back to root.
app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect("/");
    })
})

// Profile Route: Protected route that returns the authenticated user's details as JSON.
app.get("/profile", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send('Not Logged In');
    res.json(req.user);

})







app.listen((PORT), () => {

    console.log(`Server is running on Port:${PORT}`);
})