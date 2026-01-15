import express from "express";
import chatRoutes from "./routes/conversation.route.js";
import messageRoutes from "./routes/message.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "./utils/apiError.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

// 1. Parse Allowed Origins
const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map(origin => origin.trim()) || [];

// 2. Define Configuration ONCE
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log(`Blocked by CORS: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// 3. Apply Middleware (Handles Preflight automatically)
app.use(cors(corsOptions));

// REMOVED: app.options("*", cors()); <--- This was the cause of the bug

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser()); // Keep cookie parser

// Chat Routes
app.use("/api/v1/chat/conversations", chatRoutes);
app.use("/api/v1/chat/messages", messageRoutes);

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