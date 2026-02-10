import express from "express"
import { users } from "./user.js"


const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from Server")
})
app.get("/api/users", (req, res) => {
    res.send(users);
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");

})