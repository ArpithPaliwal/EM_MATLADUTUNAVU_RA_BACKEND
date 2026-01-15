import type { IConversationParticipantService } from "./interfaces/ConversationParticipant.service.interface.js";
import type { CreateConversationParticipantDTO } from "../dtos/createConversationParticipant.dto.js";
import type { IConversationParticipantRepository } from "../repositories/interfaces/conversationParticipant..repository.interface.js";
import { ConversationParticipantRepository } from "../repositories/conversationParticipant.repository.js";



export class ConversationParticipantService implements IConversationParticipantService {
    constructor(private conversationParticipantRepository: IConversationParticipantRepository   = new ConversationParticipantRepository()) { }
    async createConversationParticipants(data: CreateConversationParticipantDTO, session: any): Promise<void> {
        // Implementation for creating conversation participants
        
        await this.conversationParticipantRepository.createConversationParticipants(data,session);
    }

    async updateConversationParticipants(data:any,userId:any): Promise<void> {

        const {_id , senderId, conversationId,} = data;
        console.log("SERVICE DATA RECEIVED:", data);
        await this.conversationParticipantRepository.updateConversationParticipants(_id,userId,conversationId,senderId);
    }
    async resetUnreadCounts(conversationParticipantId: string): Promise<void> {
        await this.conversationParticipantRepository.resetUnreadCounts(conversationParticipantId)
    }
    async updateLastReadMessageId(conversationId: string, lastReadMessageId: string, userId:string): Promise<void> {
        await this.conversationParticipantRepository.updateLastReadMessageId(conversationId,lastReadMessageId,userId)
    }
}

