import type { createGroupConversationDTO, PrivateConversationDTO } from "../../dtos/createPrivateConversation.dto.js";

export interface IConversationService {
    createPrivateConversation(data: PrivateConversationDTO): Promise<any>;
    createGroupConversation(data: createGroupConversationDTO): Promise<any>;
    getUserConversations(userId: string): Promise<any>;
    updateConversationLastMessage(conversationId: string, messageId: string, messageText: string, senderId: string,createdAt:string): Promise<any>;
    // getConversationMembers(conversationId: string): Promise<any>;
    updateGroupAvatar(userId:string,createdBy:string,groupId:string,groupAvatarFile:string):Promise<any>
    updateGroupName(userId:string,CreatedBy:string,groupId:string,name:string):Promise<any>
    leaveGroup(userId:string,groupId:string):Promise<any>
}