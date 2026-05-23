import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { connectDb } from "./utils/connectDb.js";
import { User } from "./models/User.js";

// Load environment variables
dotenv.config();

const dummyUsers = [
    {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "password123"
    },
    {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        password: "password123"
    },
    {
        name: "Alex Johnson",
        email: "alex.johnson@example.com",
        password: "password123"
    },
    {
        name: "Emily Brown",
        email: "emily.brown@example.com",
        password: "password123"
    },
    {
        name: "Michael Green",
        email: "michael.green@example.com",
        password: "password123"
    }
];

const seedDatabase = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("❌ Error: MONGODB_URI is not defined in the environment variables.");
            process.exit(1);
        }

        console.log("🔌 Connecting to the database...");
        await connectDb();

        // Ensure connection is established
        if (mongoose.connection.readyState !== 1) {
            console.error("❌ Database connection was not established successfully.");
            process.exit(1);
        }

        console.log("🧹 Clearing existing users from the collection...");
        await User.deleteMany({});
        console.log("✅ Existing users cleared successfully.");

        console.log("🔒 Hashing passwords and preparing dummy data...");
        const hashedUsers = await Promise.all(
            dummyUsers.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                return {
                    ...user,
                    password: hashedPassword
                };
            })
        );

        console.log("🚀 Seeding dummy users into the database...");
        const insertedUsers = await User.insertMany(hashedUsers);

        console.log("\n==========================================");
        console.log("🎉 Database Seeded Successfully!");
        console.log(`Successfully seeded ${insertedUsers.length} dummy users:`);
        console.log("==========================================");

        insertedUsers.forEach((user, index) => {
            console.log(`${index + 1}. Name: ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Password (plain): password123`);
            console.log(`   Password (hashed): ${user.password.substring(0, 20)}...`);
            console.log("------------------------------------------");
        });

    } catch (error) {
        console.error("❌ Error seeding the database:", error);
    } finally {
        console.log("🔌 Disconnecting from the database...");
        await mongoose.disconnect();
        console.log("👋 Database connection closed.");
        process.exit(0);
    }
};

seedDatabase();
