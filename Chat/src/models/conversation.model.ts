import mongoose, { Schema, Model } from "mongoose";
import type  { IConversation } from "./interface/conversation.interface.js";

const groupAvatarSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      
    },
  },
  { _id: false }
);

const conversationSchema = new Schema<IConversation>(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Group-only
    groupName: {
      type: String,
      trim: true,
    },

    groupAvatar: {
      type: groupAvatarSchema,
    },

    
    lastMessageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },

    lastMessageText: {
      type: String,
    },

    lastMessageSenderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    lastMessageAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Conversation=
  mongoose.model<IConversation>("Conversation", conversationSchema);
