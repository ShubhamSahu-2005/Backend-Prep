import { Router } from "express";
import { createOrder, verifyPayment } from "./order.controller.js";
import { authHandler } from "../../middleware/AuthHandler.js";

export const orderRoutes = Router();
orderRoutes.post("/order/create", authHandler, createOrder);
orderRoutes.post("/order/verify", authHandler, verifyPayment);
