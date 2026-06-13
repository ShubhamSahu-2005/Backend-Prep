import { Router } from "express";
import { registerUser, login, refreshToken, logout } from "./auth.controller.js";

export const authRoutes = Router();
authRoutes.post("/register", registerUser);
authRoutes.post("/login", login);
authRoutes.post("/refreshToken", refreshToken);
authRoutes.post("/logout", logout);
