import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.post(
    "/",
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1h" }
        );

        const { password: _, ...userData } = user.toObject();

        res.status(200).json({
            token,
            user: userData,
        });
    })
);

export default router;
