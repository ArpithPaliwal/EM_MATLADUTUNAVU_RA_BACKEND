import express from "express";
import userRoutes from "./routes/user.routes.js";
import cors from "cors";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "./utils/apiError.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.set("trust proxy", 1);


// Allowed origins from env
const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map(origin => origin.trim());

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps)
      if (!origin || allowedOrigins?.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS blocked"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// important for preflight
app.options("*", cors());

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
