import { Server } from "socket.io";
import http from "http";
import { socketAuthMiddleware } from "./socket.middleware.js";
import { handleSocketConnection } from "./socket.handlers.js";
let io: Server;
export const initSocketServer = (server: http.Server): Server => {
   io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
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