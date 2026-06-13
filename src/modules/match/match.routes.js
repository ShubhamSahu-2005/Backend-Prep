import { Router } from "express";
import { createMatch } from "./match.controller.js";

export const matchRoutes = Router();
matchRoutes.post("/", createMatch);