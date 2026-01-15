// message.model.ts
import mongoose, { Schema, Model } from "mongoose";
import type { IMessage } from "./interface/message.interface.js";

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: function () {
        return !this.imageUrl && !this.videoUrl;
      },
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
      
  },
  imagePublicId: {
      type: String,
      trim: true,
      
  },
    videoUrl: {
      type: String,
      trim: true,   
  },
  videoPublicId: {
      type: String,
      trim: true,
      
  },

    
  },
  {
    timestamps: true,
  }
);

export const Message: Model<IMessage> =
  mongoose.model<IMessage>("Message", messageSchema);
