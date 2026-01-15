import express from "express";
import userRoutes from "./routes/user.routes.js";
import cors from "cors";
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
      if (!origin) return callback(null, true); // allow postman/mobile
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// IMPORTANT: allow preflight requests
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
