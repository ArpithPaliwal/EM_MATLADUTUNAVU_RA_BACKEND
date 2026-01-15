import { Server } from "socket.io";
import http from "http";
import { socketAuthMiddleware } from "./socket.middleware.js";
import { handleSocketConnection } from "./socket.handlers.js";
import dotenv from "dotenv";
dotenv.config();

let io: Server;

const allowedOrigins =
  process.env.CORS_ORIGIN?.split(",").map(o => o.trim()) || [];

export const initSocketServer = (server: http.Server): Server => {
  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, origin);
        }

        return callback(null, false);
      },
      credentials: true,
    },
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
