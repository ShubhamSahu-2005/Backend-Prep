import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.js";

const router = express.Router();

router.get(
    "/",
    asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const total = await User.countDocuments();
        const data = await User.find()
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });
    })
);

export default router;
