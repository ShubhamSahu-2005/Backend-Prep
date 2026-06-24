import Queue from "bull";
import Redis from "ioredis";
const redisConfig = new Redis(process.env.REDIS_URL || 'http://localhost:6379');

const queueOptions = {
    redis: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000

        },
        removeOnComplete: true,
        removeOnFail: false
    }
};

const emailQueue = new Queue('email-processing', queueOptions);
export {
    emailQueue
}

// Retry mechanism: Jobs automatically retry up to 3 times with exponential backoff
// Memory management: Completed jobs are removed automatically to prevent Redis memory bloat
// Environment-based configuration: Easy to adapt for different deployment environments
// Multiple queue support: Separate queues for different job types allow independent scaling