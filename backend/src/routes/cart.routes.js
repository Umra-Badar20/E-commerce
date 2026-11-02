import express from "express";
import { addToCart, getCart, removeFromCart } from "../controllers/cart.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router()

router.post("/items",authenticateToken,addToCart)
router.delete("/items/:productId",authenticateToken,removeFromCart)
router.get("/",authenticateToken,getCart)

export default router