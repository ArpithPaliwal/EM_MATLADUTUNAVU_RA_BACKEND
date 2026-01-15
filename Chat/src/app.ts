import express from "express";
import chatRoutes from "./routes/conversation.route.js";
import messageRoutes from "./routes/message.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "./utils/apiError.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://em-matladutunavu-ra-frontend.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// important for preflight
app.options("*", cors());

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

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
