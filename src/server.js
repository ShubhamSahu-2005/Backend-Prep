import "dotenv/config";
import express from "express";
import cors from "cors";
import { todoRoutes } from "./modules/todo/todo.routes.js";
import { connectDb } from "./utils/connectDb.js";
import Redis from "ioredis";
import session from "express-session";
import "./events/paymentEvent.js"
import passport from "passport";
import mongoose from "mongoose";
import('./config/passport.js');
import { matchRoutes } from "./modules/match/match.routes.js";
import { limiter } from "./middleware/rateLimiter.js";
import { usersRoutes } from "./modules/users/users.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { orderRoutes } from "./modules/order/order.routes.js";

const app = express();
app.set("trust proxy", 1);

app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true
}));
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6739');

// 1. Session Middleware: Creates and signs a session cookie for client requests to persist authentication state.
app.use(session(
    {
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    }
))
function otpPhone(phone) {
    return `otp:${phone}`;
}

// 2. Initialize Passport: Sets up Passport's internal state and hooks it into Express.
app.use(passport.initialize());

// 3. Connect Passport to Sessions: Deserializes the session cookie and attaches the authenticated user object to 'req.user'.
app.use(passport.session());

// Register API Routes
app.use(authRoutes);
app.use(orderRoutes);
app.use(todoRoutes);
app.use(usersRoutes);
app.use(matchRoutes);

const PORT = process.env.PORT || 3000;
app.use(limiter);

app.get("/redis", async (req, res) => {
    const reply = await redis.ping();
    res.json({
        redis: reply,
    })
})

// Root Route: Checks if user is logged in (req.isAuthenticated() returns true) and greets them.
app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.send(`Hello,${req.user.displayName}!<a href="/logout">Logout</a>`);

    } else {
        res.send('<a href="/auth/google">Login with Google</a>');


    }
});
app.post("/otp", async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await redis.set(otpPhone(phone), otp, 'EX', 30);
    res.json({
        message: "OTP sent", otp
    })
})
app.post("/verify", async (req, res) => {
    const { phone, otp } = req.body;
    const storedOtp = await redis.get(otpPhone(phone));
    if (!storedOtp) {
        return res.status(400).json({
            message: "OTP not found or Expired",
        })
    }
    if (storedOtp == otp) {
        await redis.del(otpPhone(phone));
        res.json({
            message: "Otp Verified succesfully"
        })
    }
    else {
        return res.status(400).json({
            message: " Invaild OTP"
        })
    }
})
app.get("/otp/:phone/ttl", async (req, res) => {
    const ttl = await redis.ttl(otpPhone(req.params.phone));
    res.json({
        message: `Your OTP will expire in ${ttl} seconds`
    })

}
)

app.get("/mongo", async (req, res) => {
    await connectDb();
    res.json({
        mongo: "connected",
        database: mongoose.connection.name,
    })

})

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







connectDb();

app.listen((PORT), () => {
    console.log(`Server is running on Port:${PORT}`);
})