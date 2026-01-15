import { Types } from "mongoose";
export type MessageSeenStatus = "delivered" | "read";
export interface IMessage {
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;

    text: string;
    imageUrl?: string;
    imagePublicId?: string;
    videoUrl?: string;
    videoPublicId?: string;
    messageSeenStatus?: MessageSeenStatus;
    createdAt: Date;
    updatedAt: Date;
}
