// 
import { Socket } from "socket.io";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import cookie from "cookie";

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  const req = socket.request as any;

  // 1. Always initialize cookies
  req.cookies = {};

  // 2. Parse raw cookies
  const rawCookies = req.headers.cookie;
  if (rawCookies) {
    req.cookies = cookie.parse(rawCookies);
  }

  // 3. Fallback: handshake token (optional client auth)
  if (!req.cookies.accessToken && socket.handshake.auth?.token) {
    req.cookies.accessToken = socket.handshake.auth.token;
  }

  // 4. Fallback: Authorization header
  if (!req.cookies.accessToken && req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    req.cookies.accessToken = token;
  }

  // // 5. Fake response for JWT middleware
  // const res = {
  //   status: () => ({
  //     json: () => {},
  //   }),
  // };

  // // 6. Verify JWT using your existing middleware
  // verifyJWT(req, res as any, (err?: any) => {
  //   if (err) return next(new Error("Unauthorized socket connection"));

  //   const user = req.user;
  //   if (!user?._id) return next(new Error("Unauthorized socket connection"));

  //   // 7. Attach identity to socket
  //   socket.data.userId = user._id.toString();
  //   socket.data.activeConversations = new Set<string>();

  //   next();
  // });
  verifyJWT(req, null as any, (err?: any) => {
        if (err) return next(new Error('Unauthorized'));
        const user = req.user;
        if (!user?._id) return next(new Error('Unauthorized'));
        socket.data.userId = user._id.toString();
        socket.data.activeConversations = new Set<string>();
        next();
    });
};
