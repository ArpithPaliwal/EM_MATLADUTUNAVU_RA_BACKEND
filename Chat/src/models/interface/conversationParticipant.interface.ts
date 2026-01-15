import { Types } from "mongoose";

export interface IConversationParticipant {
  _id: Types.ObjectId;

  conversationId: Types.ObjectId; // ref Conversation
  userId: Types.ObjectId;         // ref User

  unreadCount: number;

  lastReadMessageId?: Types.ObjectId;
  
  // senderId?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}
