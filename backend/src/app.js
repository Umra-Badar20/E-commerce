import "./load-env.js";
import express  from "express";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./db/db.js";
import { getProducts } from "./controllers/product.controller.js";

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
}
const app = express();

app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        next(error);
    }
});

app.use("/api/auth", authRoutes)
app.use("/api/product",productRoutes )
app.use("/api/cart",cartRoutes )
app.get("/",getProducts)
export default app;