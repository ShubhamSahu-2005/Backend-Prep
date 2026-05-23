import { Router } from "express";
import { registerUser, login, refreshToken, logout } from "./auth.controller";

export const router = Router();
router.post("/register", registerUser);
router.post("/login", login);
router.post("/refreshToken", refreshToken);
router.post("/logout", logout);