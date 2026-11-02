import express from "express";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../controllers/product.controller.js";
const router = express.Router();
import { authenticateToken, requireAdmin } from "../middlewares/auth.middleware.js";
import uploadProductImage from "../middlewares/upload.middleware.js";
// /api/auth/register
router.post("/create", authenticateToken,requireAdmin,uploadProductImage,createProduct);
router.patch("/:productId", authenticateToken, requireAdmin, uploadProductImage, updateProduct);
router.delete("/:productId", authenticateToken, requireAdmin, deleteProduct);
router.get("/",getProducts);

export default router;