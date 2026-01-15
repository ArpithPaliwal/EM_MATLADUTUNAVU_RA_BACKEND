import type { CreateConversationParticipantDTO } from "../../dtos/createConversationParticipant.dto.js";

export interface IConversationParticipantRepository {
    createConversationParticipants(data: CreateConversationParticipantDTO, session: any): Promise<void>;
    updateConversationParticipants(_id: string, userId: string, conversationId: string, senderId: string): Promise<void>;
    resetUnreadCounts(_id:string):Promise<void>
    updateLastReadMessageId(conversationId:string, lastReadMessageId:string,userId:string):Promise<void>
}