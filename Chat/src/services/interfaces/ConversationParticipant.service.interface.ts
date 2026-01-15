import type { CreateConversationParticipantDTO } from "../../dtos/createConversationParticipant.dto.js";

export interface IConversationParticipantService {
    createConversationParticipants(data: CreateConversationParticipantDTO, session: any): Promise<void>;
    updateConversationParticipants(data:any,userId:any):Promise<void>;
    resetUnreadCounts(conversationParticipantId:string):Promise<void>
    updateLastReadMessageId(conversationId:string, lastReadMessageId:string,userId:string):Promise<void>
}