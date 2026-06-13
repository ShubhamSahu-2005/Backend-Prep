
import mongoose from "mongoose";

export const connectDb = async () => {
    try {
        if (mongoose.connection.readyState === 0) {
            const primaryUri = process.env.MONGODB_URI || process.env.MONGO_URL;
            const fallbackUri = 'mongodb://localhost:27017/maindb';

            if (primaryUri) {
                try {
                    await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 3000 });
                    console.log("MongoDB connected successfully to primary database");
                    return;
                } catch (err) {
                    console.warn(`Primary MongoDB connection failed: ${err.message}. Falling back to local MongoDB...`);
                }
            }

            await mongoose.connect(fallbackUri);
            console.log("MongoDB connected successfully to local database");
        }
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}
