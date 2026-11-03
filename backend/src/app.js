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
if (process.env.NODE_ENV === "production" && !process.env.FRONTEND_URL) {
    throw new Error("FRONTEND_URL environment variable is required in production");
}

const app = express();
const allowedOrigins = [
    "http://localhost:5173",
    "https://e-commerce-livid-iota-45.vercel.app",
    ...(process.env.FRONTEND_URL || "").split(","),
]
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        callback(null, !origin || allowedOrigins.includes(origin));
    },
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