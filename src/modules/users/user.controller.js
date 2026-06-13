import Redis from "ioredis";
import { connectDb } from "../../utils/connectDb.js";
import { User } from "../../models/User.js";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6739");


export const getUsers = async (req, res) => {
    await connectDb();
    const key = `users`;
    const cached = await redis.get(key);
    if (cached) {
        return res.status(200).json(JSON.parse(cached));
    }
    const users = await User.find();
    await redis.set(key, JSON.stringify(users), "EX", 5 * 60);
    res.json({
        users
    })
}