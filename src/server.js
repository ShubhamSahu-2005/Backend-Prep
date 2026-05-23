import express from "express";
import { todoRoutes } from "./modules/todo/todo.routes.js";

const app = express();



const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use("/api/todo", todoRoutes)







app.listen((PORT), () => {

    console.log(`Server is running on Port:${PORT}`);
})