import type { IConversationParticipantRepository } from "./interfaces/conversationParticipant..repository.interface.js";
import type { CreateConversationParticipantDTO } from "../dtos/createConversationParticipant.dto.js";
import { ConversationParticipant } from "../models/conversationParticipant.model.js";
import type { ClientSession } from "mongoose";

export class ConversationParticipantRepository implements IConversationParticipantRepository {
    async createConversationParticipants(data: CreateConversationParticipantDTO, session: ClientSession): Promise<void> {

        const { userIds, conversationId } = data;
        const docs = userIds.map(userId => ({ userId, conversationId }));
        console.log("docs ",docs);
        
        const createdCoversationParticipant=await ConversationParticipant.insertMany(docs, { session });
        console.log("conversation participant repo ",createdCoversationParticipant);
        
    }
    async updateConversationParticipants(_id: string, userId: string, conversationId: string, senderId: string): Promise<void> {
        console.log("updated undread ");

        await ConversationParticipant.updateOne(
            { userId, conversationId },
            {
                $inc: { unreadCount: 1 },
                // $set: { senderId, lastReadMessageId: _id }
            }
        );

    }
    async resetUnreadCounts(_id: string): Promise<void> {
        await ConversationParticipant.updateOne(
            { _id },
            { $set: { unreadCount: 0 } }
        );
    }
    async updateLastReadMessageId(conversationId: string, lastReadMessageId: string, userId: string): Promise<void> {
        await ConversationParticipant.updateOne(
            { conversationId, userId },
            { lastReadMessageId }
        );
    }
}