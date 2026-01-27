import express from "express";
import userRoutes from "./routes/user.routes.js";
import cors from "cors";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "./utils/apiError.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// 1. Debugging: This will print inside your SERVER logs (check AWS/Render logs, not browser)
console.log("Allowed Origins:", process.env.CORS_ORIGIN);

// 2. Parse Allowed Origins
const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map(origin => origin.trim()) || [];

// 3. Define the Configuration ONCE
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log(`Blocked by CORS: ${origin}`); // Helpful for debugging
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With","Cookie"],
};

app.set("trust proxy", 1);

// 4. Apply Middleware (Handles Preflight automatically)
app.use(cors(corsOptions));

// Remove this line! It overrides the config above with defaults.
// app.options("*", cors()); <--- DELETE THIS
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/api/v1/users", userRoutes);

app.use(errorHandler);

export function errorHandler(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err.statusCode ?? 500;
  return res.status(statusCode).json({
    success: err.success ?? false,
    message: err.message ?? "Internal server error",
    errors: err.errors ?? [],
    data: err.data ?? null,
  });
}

export { app };