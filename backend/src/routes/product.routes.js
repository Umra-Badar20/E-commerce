import express from "express";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../controllers/product.controller.js";
const router = express.Router();
import { authenticateToken, requireAdmin } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
// /api/auth/register
router.post("/create", authenticateToken,requireAdmin,upload.single("image"),createProduct);
router.put("/:id", authenticateToken, requireAdmin, upload.single("image"), updateProduct);
router.delete("/:id", authenticateToken, requireAdmin, deleteProduct);
router.get("/",getProducts);

export default router;