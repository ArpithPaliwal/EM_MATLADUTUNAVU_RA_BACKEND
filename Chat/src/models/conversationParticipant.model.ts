import mongoose, { Schema, Model } from "mongoose";
import type { IConversationParticipant } from "./interface/conversationParticipant.interface.js";

const conversationParticipantSchema =
  new Schema<IConversationParticipant>(
    {
      conversationId: {
        type: Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
        index: true,
      },

      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      // senderId: {
      //   type: Schema.Types.ObjectId,
      //   ref: "User",
      // },
      unreadCount: {
        type: Number,
        default: 0,
      },

      lastReadMessageId: {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },

      

      
    },
    {
      timestamps: true,
    }
  );

/**
 * Prevent duplicate participant records
 * (one user can appear only once per conversation)
 */
conversationParticipantSchema.index(
  { conversationId: 1, userId: 1 },
  { unique: true }
);

export const ConversationParticipant: Model<IConversationParticipant> =
  mongoose.model<IConversationParticipant>(
    "ConversationParticipant",
    conversationParticipantSchema
  );
