import "dotenv/config"
import express from "express"
import { connectDb } from "./utils/connectDb.js"
import { User } from "./models/user.js"

const app = express();
app.use(express.json());

connectDb();

app.get("/", (req, res) => {
    res.send("Hello from Server")
})
//Q.2
app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (error) {
        res.status(500).send({ error: "Failed to fetch users" });
    }
})
//Q.3
app.post("/api/users", async (req, res) => {
    try {
        const { name, email } = req.body;
        const newUser = await User.create({ name, email });
        res.status(201).send(newUser);
    } catch (error) {
        res.status(400).send({ error: "Failed to create user", details: error.message });
    }
})

// Search Endpoint
app.get("/api/search", async (req, res) => {
    try {
        const { q, limit } = req.query;
        if (!q) {
            return res.status(400).send({ error: "Query parameter 'q' is required" });
        }

        const limitValue = parseInt(limit) || 10;
        const users = await User.find({
            name: { $regex: q, $options: "i" }
        }).limit(limitValue);

        res.send(users);
    } catch (error) {
        res.status(500).send({ error: "Failed to search users", details: error.message });
    }
})

//Q.4
app.get("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (user) {
            res.send(user);
        } else {
            res.status(404).send("User not Found")
        }
    } catch (error) {
        // Handle invalid ObjectId format or other errors
        if (error.kind === 'ObjectId') {
            return res.status(404).send("User not Found");
        }
        res.status(500).send({ error: "Failed to fetch user", details: error.message });
    }
})


app.listen(3000, () => {
    console.log("Server is running on port 3000");

})