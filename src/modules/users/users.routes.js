import { redisLimiter } from "../../middleware/rateLimiter.js";
import { getUsers } from "./user.controller.js";
import { Router } from "express";

export const usersRoutes = Router();
usersRoutes.get("/users", redisLimiter, getUsers);