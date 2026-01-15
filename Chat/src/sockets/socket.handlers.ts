import { Server, Socket } from "socket.io";
import { registerConversationEvents } from "./events/conversation.events.js";


export const handleSocketConnection = (
    io: Server,
    socket: Socket
) => {
    const userId = socket.data.userId;
    // socket.data.activeConversations = new Set<string>();
    socket.join(`user:${userId}`);

    registerConversationEvents(io, socket);
    // registerMessageEvents(io, socket);
    
    socket.on("disconnect", () => {
        console.log(`Socket disconnected → user=${userId}, socket=${socket.id}`);
    });
};
