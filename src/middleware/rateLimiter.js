import rateLimit from "express-rate-limit";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6739");
//rateLimit using express-rate-limit
export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: "Too many req for this ip",
    statusCode: 429,

})


//rate limit using  in memory storage
const requestCount = new Map(); // Use Map instead of array

export const rateLimiter = async (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const timeLimit = 1 * 60 * 1000;
    const limit = 5;

    if (!requestCount.has(ip)) {
        requestCount.set(ip, {
            count: 1,
            windowStart: now
        });
    } else {
        const record = requestCount.get(ip);
        if (now - record.windowStart > timeLimit) {
            // Reset the window
            requestCount.set(ip, {
                count: 1,
                windowStart: now
            });
        } else {
            record.count++;
        }
    }

    if (requestCount.get(ip).count > limit) {
        return res.status(429).json({
            message: "Too Many request for this Ip"
        });
    }

    next();
}


//Rate Limiter using Redis
export const redisLimiter = async (req, res, next) => {
    const ip = req.ip;
    const key = `rate-limit:${ip}`;
    const limit = 100;
    const windowSize = 15 * 60; // 15 minutes in seconds

    try {
        const requestCount = await redis.incr(key);

        // If it's the first request in the window, set the expire time
        if (requestCount === 1) {
            await redis.expire(key, windowSize);
        } else {
            // Guard against the race condition where expire failed to execute
            const ttl = await redis.ttl(key);
            if (ttl === -1) {
                await redis.expire(key, windowSize);
            }
        }

        if (requestCount > limit) {
            return res.status(429).json({
                message: "Too Many request"
            });
        }
        next();
    } catch (err) {
        console.error("Redis rate limiter error:", err);
        next(); // Fallback: allow request through if redis is down
    }
}
