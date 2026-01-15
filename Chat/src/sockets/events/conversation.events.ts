import { Server, Socket } from "socket.io";
import { Message } from "../../models/message.model.js";
import { MessageService } from "../../services/message.service.js";
import { emitMessageDeleteEvents, emitMessageEvents } from "./message.events.js";
import { ConversationParticipantService } from "../../services/conversationParticipant.service.js";

const messageService = new MessageService();
const conversationParticipantService = new ConversationParticipantService();

export const registerConversationEvents = (
  io: Server,
  socket: Socket
) => {

  socket.on("conversation:join", (payload: any) => {
    let conversationIds: string[] = [];

    if (Array.isArray(payload)) {
        conversationIds = payload;
    } else if (typeof payload === "string") {
        // If it looks like a list "['abc', 'def']", parse it. If not, just wrap it.
        try {
            const parsed = JSON.parse(payload);
            conversationIds = Array.isArray(parsed) ? parsed : [payload];
        } catch {
            conversationIds = [payload];
        }
    }
  conversationIds.forEach((id: string) => {
    console.log(`📢 RECEIVED JOIN REQUEST from Socket ${socket.id} for payload:`, conversationIds);
    socket.join(`conversation:${id}`);
  });
  });

  socket.on("conversation:active", (conversationId: string) => {
    socket.data.activeConversations.add(conversationId);
  });

  socket.on("conversation:inactive", (conversationId: string) => {
    socket.data.activeConversations.delete(conversationId);
  });

  socket.on(
  "message:send",
  async (
    payload: {
      conversationId: string;
      senderId: string;
      text?: string;
      filePath?: string;   // temp path for image/video (if any)
    },
    ack?: (response: any) => void
  ) => {
    try {
      const { conversationId, senderId, text, filePath } = payload;

      const message = await messageService.createMessage(
        conversationId,
        senderId,
        text || "",
        filePath
      );
      emitMessageEvents(io, message);
      // acknowledge back to the sender
      ack?.({ ok: true, message });

    } catch (err: any) {
      console.error("message:send failed:", err);
      ack?.({ ok: false, error: err.message || "Something went wrong" });
    }
  }
);
socket.on(
  "message:delete",
  async (payload: { messageId: string; senderId: string }) => {
    try {
      const { messageId, senderId } = payload;
      console.log("dletmessdetails",payload)
      const deletedMessage = await messageService.deleteMessage(
        messageId,
        senderId
      );

      emitMessageDeleteEvents(io, deletedMessage);

    } catch (err: any) {
      console.error("message:delete failed:", err);
    }
  }
);

socket.on(
  "conversationParticipant:unreadCount",
  async (conversationParticipantId: string) => {
    if (!conversationParticipantId) return;

    await conversationParticipantService.resetUnreadCounts(conversationParticipantId);
  }
);

socket.on("conversation:read", async ({ conversationId, lastReadMessageId }) => {
  const userId=socket.data.userId
  await conversationParticipantService.updateLastReadMessageId(conversationId,lastReadMessageId,userId)
});
};



