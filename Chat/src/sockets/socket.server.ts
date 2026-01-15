import { Server } from "socket.io";
import http from "http";
import { socketAuthMiddleware } from "./socket.middleware.js";
import { handleSocketConnection } from "./socket.handlers.js";

let io: Server;

const allowedOrigins = [
  "http://localhost:5173",
  "https://em-matladutunavu-ra-frontend.vercel.app",
];

export const initSocketServer = (server: http.Server): Server => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
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
