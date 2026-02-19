import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import { connectDb } from "./utils/connectDb.js";
import { User } from "./models/user.js";
import { logger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authHandler } from "./middleware/AuthHandler.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import uploadRoutes from "./src/uploads/route.js";
import postsRoutes from "./posts/route.js"
import loginRoutes from "./login/route.js"

import cors from "cors";

const app = express();

app.use(express.json());
app.use(logger);
app.use("/api", authHandler);
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}
))

// Async wrapper
// Async wrapper imported from utils

// Root Route
app.get("/", (req, res) => {
    res.send("Hello from Server");
});


// ================= USERS ROUTES =================

// Get all users
app.get(
    "/api/users",
    asyncHandler(async (req, res) => {
        const users = await User.find({});
        res.status(200).json(users);
    })
);
app.use("/api/upload", uploadRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/login", loginRoutes);

// Create user
app.post(
    "/api/users",
    asyncHandler(async (req, res) => {
        const { name, email } = req.body;

        if (!name || !email) {
            const error = new Error("Name and email are required");
            error.statusCode = 400;
            throw error;
        }

        const newUser = await User.create({ name, email });
        res.status(201).json(newUser);
    })
);
app.post("/api/register", asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        const error = new Error(" The required infos are not provided")
        error.statusCode = 400;
        throw error;
    }
    const emailValidator = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValidator.test(email)) {
        const error = new Error("Invalid error Format");
        error.statusCode = 400;
        throw error;
    }
    if (password.length < 6) {
        const error = new Error("Password must be at least 6 characters long");
        error.statusCode = 400;
        throw error;
    }
    const user = await User.create({ name, email, password });
    res.status(201).json(user);


}))

// Search users
app.get(
    "/api/search",
    asyncHandler(async (req, res) => {
        const { q, limit } = req.query;

        if (!q) {
            const error = new Error("Query parameter 'q' is required");
            error.statusCode = 400;
            throw error;
        }

        const limitValue = Math.min(Number(limit) || 10, 50);

        const users = await User.find({
            name: { $regex: q, $options: "i" },
        }).limit(limitValue);

        res.status(200).json(users);
    })
);

// Get user by ID
app.get(
    "/api/users/:id",
    asyncHandler(async (req, res) => {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = new Error("Invalid user ID format");
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findById(id);

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(user);
    })
);
app.put("/api/users/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid Id");
        error.statusCode = 400;
        throw error;
    }
    const { name, email } = req.body;
    if (!name || !email) {
        console.log("Info not provided");
        return res.status(400).json({ message: "Info not provided" })
    }
    const updateUser = await User.findByIdAndUpdate(id, { name, email }, { new: true, runValidators: true })
    if (!updateUser) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    res.status(200).json(updateUser);
}))

app.delete("/api/users/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid Id");
        error.statusCode = 400;
        throw error;
    }

    const deleteUser = await User.findByIdAndDelete(id);
    if (!deleteUser) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    return res.status(200).json({ message: "User deleted" })




}))


// 404 handler for unknown routes
app.use((req, res, next) => {
    const error = new Error("Route not found");
    error.statusCode = 404;
    next(error);
});

// Global error handler (must be last)
app.use(errorHandler);


// ================= SERVER STARTUP =================

const startServer = async () => {
    try {
        await connectDb();
        app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });
    } catch (err) {
        console.error("Database connection failed:", err.message);
        process.exit(1);
    }
};

startServer();
