import { Server } from "socket.io";
import { ConversationParticipantService }
  from "../../services/conversationParticipant.service.js";

const conversationParticipantService =
  new ConversationParticipantService();

import { ConversationService } from "../../services/conversation.service.js";
const conversationService = new ConversationService();

export const emitMessageEvents = async (
  io: Server,
  message: any
) => {
  const { conversationId, senderId,text } = message;
  console.log("🔍 DEBUG: Full Message Object:", message);



  // 2. Log the exact room name we are trying to talk to
  const roomName = `conversation:${conversationId}`;
  console.log(`📢 DEBUG: Emitting to Room: '${roomName}'`);

  // 3. Check if anyone is actually inside that room
  const sockets = await io.in(roomName).fetchSockets();
  console.log(`👥 DEBUG: Sockets found in room '${roomName}':`, sockets.length);

  // The actual emit

  io.to(`conversation:${conversationId}`).emit("message:new", message);


  const socketsInRoom = await io
    .in(`conversation:${conversationId}`)
    .fetchSockets();

  const activeUsers = new Set<string>();

  for (const socket of socketsInRoom) {
    if (
      socket.data.userId &&
      socket.data.activeConversations?.has(conversationId)
    ) {
      activeUsers.add(socket.data.userId);
    }
  }
  const allMembers = await conversationService.getConversationMembers(
    conversationId
  );
  for (const memberId of allMembers) {
  if (memberId === senderId) continue;

  const isActive = activeUsers.has(memberId);

  if (!isActive) {
    io.to(`user:${memberId}`).emit("conversation:unreadUpdate", {
      conversationId,
      incrementBy: 1,
      text     
    });
    console.log(`🔔 DEBUG: Emitted 'conversation:unreadUpdate' to user:${memberId} for conversation:${conversationId}`);
    await conversationParticipantService.updateConversationParticipants(
      message,
      memberId
    );
  }

    // await conversationParticipantService.updateConversationParticipants(
    //   message,
    //   memberId
    // );
  }
}
export const emitMessageDeleteEvents = (io: Server, message: any) => {
  console.log("emitmesgdlt", message._id.toString());

  io.to(`conversation:${message.conversationId.toString()}`).emit("message:deleted", {
  messageId: message._id.toString(),
});

};



