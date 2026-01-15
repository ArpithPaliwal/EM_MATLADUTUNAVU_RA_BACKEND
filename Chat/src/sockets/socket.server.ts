import { Server } from "socket.io";
import http from "http";
import { socketAuthMiddleware } from "./socket.middleware.js";
import { handleSocketConnection } from "./socket.handlers.js";
import dotenv from "dotenv";
dotenv.config();

let io: Server;

// 1. Debugging: Print loaded origins to ensure ENV is read correctly
console.log("Socket Service: Raw CORS_ORIGIN:", process.env.CORS_ORIGIN);

const allowedOrigins =
  process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()) || [];

console.log("Socket Service: Parsed Allowed Origins:", allowedOrigins);

export const initSocketServer = (server: http.Server): Server => {
  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          // Success: Origin matches one in your list
          return callback(null, true);
        } else {
          // Failure: Origin is NOT in your list
          console.error(`Socket.io CORS Blocked Connection from: ${origin}`);
          return callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST"], // Explicitly allow these methods
    },
    // Optional: Increase ping timeout if clients disconnect frequently
    pingTimeout: 60000, 
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    handleSocketConnection(io, socket);
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};